import mongoose from "mongoose";
import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import AppError from "../utils/AppError.js";

// ==========================================
// 🛠️ HELPER: Transaction Execution
// ==========================================
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ==========================================
// 🐳 Student Services
// ==========================================

export const createStudent = async (studentData, file, isMaster, adminBranch) => {
  let uploadedFilePath = file ? file.path : null;

  try {
    if (!isMaster) {
      studentData.branch = adminBranch;
    }

    return await executeTransaction(async (session) => {
      const course = await Course.findById(studentData.course).session(session);
      if (!course) throw new AppError("Selected course not found", 404);

      if (file) studentData.photo_url = `/uploads/students/${file.filename}`;

      const [newStudent] = await Student.create([studentData], { session });

      await Batch.findByIdAndUpdate(
        newStudent.batch,
        { $addToSet: { students: newStudent._id } },
        { session }
      );

      const baseFee = course.base_fee || 0;
      const discount = Number(studentData.discount_amount) || 0;
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
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

export const modifyStudent = async (studentId, updateData, file, branchFilter, isMaster, adminBranch) => {
  return await executeTransaction(async (session) => {
    const student = await Student.findOne({ _id: studentId, ...branchFilter }).session(session);
    if (!student) throw new AppError("Student not found or access denied.", 404);

    if (!isMaster) updateData.branch = adminBranch;

    const oldBatchId = student.batch?.toString();
    const newBatchId = updateData.batch?.toString();

    if (file && student.photo_url) deleteLocalFile(student.photo_url);
    if (file) updateData.photo_url = `/uploads/students/${file.filename}`;

    Object.assign(student, updateData);
    await student.save({ session });

    if (newBatchId && oldBatchId !== newBatchId) {
      if (oldBatchId) {
        await Batch.findByIdAndUpdate(oldBatchId, { $pull: { students: student._id } }, { session });
      }
      await Batch.findByIdAndUpdate(newBatchId, { $addToSet: { students: student._id } }, { session });
    }

    return student;
  });
};

export const fetchAllStudents = async (filters, page, limit) => {
  const match = { ...filters };
  
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
    Student.aggregate([{ $match: match }, { $count: "total" }])
  ]);

  const totalCount = total.length > 0 ? total[0].total : 0;
  return {
    students,
    pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
  };
};

export const removeStudent = async (studentId, branchFilter) => {
  await executeTransaction(async (session) => {
    const student = await Student.findOne({ _id: studentId, ...branchFilter }).session(session);
    if (!student) throw new AppError("Student not found or access denied.", 404);

    if (student.photo_url) deleteLocalFile(student.photo_url);

    await Promise.all([
      Student.deleteOne({ _id: student._id }, { session }),
      Fee.deleteOne({ student: student._id }, { session }),
      Payment.deleteMany({ student: student._id }, { session }),
      student.batch ? Batch.findByIdAndUpdate(student.batch, { $pull: { students: student._id } }, { session }) : Promise.resolve()
    ]);
  });
};

export const deleteStudentImage = async (studentId, branchFilter) => {
  const student = await Student.findOne({ _id: studentId, ...branchFilter });
  if (!student) throw new AppError("Student not found or access denied.", 404);

  if (student.photo_url) deleteLocalFile(student.photo_url);
  student.photo_url = "";
  await student.save();

  return student;
};

export const switchStudentStatus = async (studentId, branchFilter) => {
  const student = await Student.findOne({ _id: studentId, ...branchFilter });
  if (!student) throw new AppError("Student not found or access denied.", 404);

  student.is_active = !student.is_active;
  await student.save();

  return student;
};

export const fetchAdminStudentById = async (studentId, branchFilter) => {
  const student = await Student.findOne({ _id: studentId, ...branchFilter })
    .populate("course", "course_name course_code duration description additional_info")
    .populate("batch", "batch_name batch_type time_slot")
    .populate({
      path: "comments",
      options: { sort: { createdAt: -1 } },
      populate: { path: "instructor", select: "full_name photo_url designation" },
    })
    .lean();

  if (!student) throw new AppError("Student not found or access denied.", 404);
  return student;
};

export const performStudentSearch = async (query, branchFilter) => {
  return await Student.find({
    ...branchFilter,
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
};

export const fetchPublicStudentSearch = async (query) => {
  const student = await Student.findOne({
    $or: [{ student_id: query.trim() }, { registration_number: query.trim() }],
    is_active: true,
  })
    .populate("course", "course_name course_code duration additional_info")
    .populate("batch", "batch_name batch_type time_slot schedule_days")
    .select("-__v -comments")
    .lean();

  if (!student) throw new AppError("Student not found or not active", 404);
  return student;
};

export const fetchPublicStudentById = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("course", "course_name course_code duration description additional_info")
    .populate("batch", "batch_name batch_type time_slot schedule_days")
    .lean();

  if (!student || !student.is_active) {
    throw new AppError("Student not found or inactive", 404);
  }
  return student;
};