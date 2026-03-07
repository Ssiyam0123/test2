import mongoose from "mongoose";
import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🛠️ HELPER: TRANSACTION SESSION
// ==========================================
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  let useTransaction = false;

  try {
    session.startTransaction();
    useTransaction = true;
  } catch (error) {
    useTransaction = false;
  }

  try {
    const result = await callback(session);
    if (useTransaction) await session.commitTransaction();
    return result;
  } catch (error) {
    if (useTransaction) await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ==========================================
// 🐳 [Controller: addStudent]
// ==========================================
export const addStudent = catchAsync(async (req, res, next) => {
  let uploadedFilePath = req.file ? req.file.path : null;

  try {
    // 🚀 Force branch to admin's branch if not master
    if (!req.isMaster) {
      req.body.branch = req.user.branch;
    }

    const student = await executeTransaction(async (session) => {
      const course = await Course.findById(req.body.course).session(session);
      if (!course) throw new AppError("Selected course not found", 404);

      if (req.file) req.body.photo_url = `/uploads/students/${req.file.filename}`;

      const [newStudent] = await Student.create([req.body], { session });

      await Batch.findByIdAndUpdate(
        newStudent.batch,
        { $addToSet: { students: newStudent._id } },
        { session }
      );

      const baseFee = course.base_fee || 0;
      const discount = Number(req.body.discount_amount) || 0;
      const netPayable = Math.max(0, baseFee - discount);

      await Fee.create(
        [{
          student: newStudent._id,
          branch: newStudent.branch,
          course: newStudent.course,
          total_amount: baseFee,
          discount: discount,
          net_payable: netPayable,
          paid_amount: 0,
          status: netPayable === 0 ? "Paid" : "Unpaid",
        }],
        { session }
      );

      return newStudent;
    });

    res.status(201).json(new ApiResponse(201, student, "Student added successfully"));
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    return next(error);
  }
});

// ==========================================
// 🐳 [Controller: updateStudent]
// ==========================================
export const updateStudent = catchAsync(async (req, res, next) => {
  const updatedStudent = await executeTransaction(async (session) => {
    // 🚀 Magic: Auto branch isolation
    const student = await Student.findOne({ _id: req.params.id, ...req.branchFilter }).session(session);
    if (!student) throw new AppError("Student not found or access denied.", 404);

    // 🚀 Prevent normal admins from changing the branch
    if (!req.isMaster) {
      req.body.branch = req.user.branch;
    }

    const oldBatchId = student.batch?.toString();
    const newBatchId = req.body.batch?.toString();

    if (req.file && student.photo_url) deleteLocalFile(student.photo_url);
    if (req.file) req.body.photo_url = `/uploads/students/${req.file.filename}`;

    Object.assign(student, req.body);
    await student.save({ session });

    if (newBatchId && oldBatchId !== newBatchId) {
      if (oldBatchId) {
        await Batch.findByIdAndUpdate(oldBatchId, { $pull: { students: student._id } }, { session });
      }
      await Batch.findByIdAndUpdate(newBatchId, { $addToSet: { students: student._id } }, { session });
    }

    return student;
  });

  res.status(200).json(new ApiResponse(200, updatedStudent, "Student updated successfully"));
});

// ==========================================
// 🐳 [Controller: getAllStudents]
// ==========================================
export const getAllStudents = catchAsync(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  
  // 🚀 ফ্রন্টএন্ড থেকে আসা সব ফিল্টার রিসিভ করছি
  const { 
    search, status, branch, batch, course, 
    is_active, is_verified, date_from, date_to 
  } = req.query;

  let match = {};

  // 🚀 1. Branch Logic: Middleware এর ফিল্টার অথবা ফ্রন্টএন্ডের পাঠানো ফিল্টার
  const effectiveBranch = req.branchFilter?.branch || branch;
  if (effectiveBranch && effectiveBranch !== "all") {
    match.branch = new mongoose.Types.ObjectId(effectiveBranch);
  }

  // 🚀 2. Batch & Course Filters (Must be cast to ObjectId for aggregation)
  if (batch && batch !== "all") {
    match.batch = new mongoose.Types.ObjectId(batch);
  }
  if (course && course !== "all") {
    match.course = new mongoose.Types.ObjectId(course);
  }

  // 🚀 3. Boolean & String Filters
  if (status && status !== "all") match.status = status;
  if (is_active && is_active !== "all") match.is_active = is_active === "true";
  if (is_verified && is_verified !== "all") match.is_verified = is_verified === "true";

  // 🚀 4. Date Range Filter
  if (date_from || date_to) {
    match.createdAt = {}; 
    if (date_from) match.createdAt.$gte = new Date(date_from);
    if (date_to) match.createdAt.$lte = new Date(date_to);
  }

  // 🚀 5. Search Filter
  if (search) {
    match.$or = [
      { student_name: { $regex: search, $options: "i" } },
      { student_id: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const [students, total] = await Promise.all([
    Student.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },

      {
        $lookup: {
          from: "fees",
          let: { studentId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$student", "$$studentId"] } } },
            // 🚀 net_payable অ্যাড করেছি কারণ ফ্রন্টএন্ডে এটা ইউজ করছিস
            { $project: { total_amount: 1, paid_amount: 1, status: 1, net_payable: 1 } }
          ],
          as: "fee_summary"
        }
      },
      { $unwind: { path: "$fee_summary", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          pipeline: [{ $project: { course_name: 1, course_code: 1 } }],
          as: "course"
        }
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "batches",
          localField: "batch",
          foreignField: "_id",
          pipeline: [{ $project: { batch_name: 1 } }],
          as: "batch"
        }
      },
      { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          pipeline: [{ $project: { branch_name: 1 } }],
          as: "branch"
        }
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } }
    ]),
    
    // Total count for pagination
    Student.aggregate([
      { $match: match },
      { $count: "total" }
    ])
  ]);

  const totalCount = total.length > 0 ? total[0].total : 0;
  const pagination = { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) };

  res.status(200).json(new ApiResponse(200, students, "Students fetched successfully", pagination));
});

// ==========================================
// 🐳 [Controller: deleteStudent]
// ==========================================
export const deleteStudent = catchAsync(async (req, res, next) => {
  await executeTransaction(async (session) => {
    // 🚀 Magic: Auto branch isolation
    const student = await Student.findOne({ _id: req.params.id, ...req.branchFilter }).session(session);
    if (!student) throw new AppError("Student not found or access denied.", 404);

    if (student.photo_url) deleteLocalFile(student.photo_url);

    await Promise.all([
      Student.deleteOne({ _id: student._id }, { session }),
      Fee.deleteOne({ student: student._id }, { session }),
      Payment.deleteMany({ student: student._id }, { session }),
      student.batch ? Batch.findByIdAndUpdate(student.batch, { $pull: { students: student._id } }, { session }) : Promise.resolve()
    ]);
  });

  res.status(200).json(new ApiResponse(200, null, "Student and all associated records deleted permanently."));
});

// ==========================================
// 🐳 [Controller: removeStudentImage]
// ==========================================
export const removeStudentImage = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation
  const student = await Student.findOne({ _id: req.params.id, ...req.branchFilter });
  if (!student) return next(new AppError("Student not found or access denied.", 404));

  if (student.photo_url) deleteLocalFile(student.photo_url);

  student.photo_url = "";
  await student.save();

  res.status(200).json(new ApiResponse(200, student, "Image removed successfully"));
});

// ==========================================
// 🐳 [Controller: toggleStudentStatus]
// ==========================================
export const toggleStudentStatus = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation
  const student = await Student.findOne({ _id: req.params.id, ...req.branchFilter });
  if (!student) return next(new AppError("Student not found or access denied.", 404));

  student.is_active = !student.is_active;
  await student.save();

  res.status(200).json(new ApiResponse(200, student, `Student ${student.is_active ? "activated" : "deactivated"} successfully`));
});

// ==========================================
// 🐳 [Controller: searchStudent]
// ==========================================
export const searchStudent = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query?.trim()) return next(new AppError("Search query is required", 400));

  const students = await Student.find({
    ...req.branchFilter, // 🚀 Direct injection from middleware
    $or: [
      { student_id: { $regex: query.trim(), $options: "i" } },
      { registration_number: { $regex: query.trim(), $options: "i" } },
      { phone: { $regex: query.trim(), $options: "i" } }
    ],
  })
    .populate("course", "course_name course_code duration")
    .populate("batch", "batch_name batch_type time_slot")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.status(200).json(new ApiResponse(200, students, "Search completed", { count: students.length }));
});

// ==========================================
// 🐳 [Controller: getAdminStudentById]
// ==========================================
export const getAdminStudentById = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation (No manual isMaster checks needed!)
  const student = await Student.findOne({ _id: req.params.id, ...req.branchFilter })
    .populate("course", "course_name course_code duration description additional_info")
    .populate("batch", "batch_name batch_type time_slot")
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: { path: "instructor", select: "full_name photo_url designation" },
    })
    .lean();

  if (!student) return next(new AppError("Student not found or access denied.", 404));

  // 🚀 Using standard ApiResponse since you fixed the frontend!
  res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});

// ==========================================
// 🐳 [Controller: publicSearchStudent] (NO BRANCH FILTER - PUBLIC)
// ==========================================
export const publicSearchStudent = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query || query.trim() === "") return next(new AppError("Search query is required", 400));

  const student = await Student.findOne({
    $or: [{ student_id: query.trim() }, { registration_number: query.trim() }],
    is_active: true,
  })
    .populate("course", "course_name course_code duration additional_info")
    .populate("batch", "batch_name batch_type time_slot schedule_days")
    .select("-__v -comments")
    .lean();

  if (!student) return next(new AppError("Student not found or not active", 404));

  res.status(200).json(new ApiResponse(200, student, "Student found"));
});

// ==========================================
// 🐳 [Controller: getPublicStudentById] (NO BRANCH FILTER - PUBLIC)
// ==========================================
export const getPublicStudentById = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate("course", "course_name course_code duration description additional_info")
    .populate("batch", "batch_name batch_type time_slot schedule_days")
    .lean();

  if (!student || !student.is_active) {
    return next(new AppError("Student not found or inactive", 404));
  }

  res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});