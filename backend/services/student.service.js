import mongoose from "mongoose";
import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import AppError from "../utils/AppError.js";

// 🛠️ HELPER: Safe Transaction Execution
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");

  try {
    if (isReplicaSet) session.startTransaction();
    const result = await callback(session, isReplicaSet);
    if (isReplicaSet) await session.commitTransaction();
    return result;
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

//  Create Student
export const createStudent = async (studentData, file, isMaster, adminBranch) => {
  const uploadedFilePath = file ? `/uploads/students/${file.filename}` : null;

  try {
    if (!isMaster) studentData.branch = adminBranch;
    if (uploadedFilePath) studentData.photo_url = uploadedFilePath;

    return await executeTransaction(async (session, isReplicaSet) => {
      const opts = isReplicaSet ? { session } : {};
      
      const course = await Course.findById(studentData.course, null, opts);
      if (!course) throw new AppError("Selected course not found", 404);

      const [newStudent] = await Student.create([studentData], opts);

      await Batch.findByIdAndUpdate(newStudent.batch, { $addToSet: { students: newStudent._id } }, opts);

      const baseFee = course.base_fee || 0;
      const discount = Number(studentData.discount_amount) || 0;
      const netPayable = Math.max(0, baseFee - discount);

      await Fee.create([{
        student: newStudent._id,
        branch: newStudent.branch,
        course: newStudent.course,
        total_amount: baseFee,
        discount: discount,
        net_payable: netPayable,
        paid_amount: 0,
        status: netPayable === 0 ? "Paid" : "Unpaid",
      }], opts);

      return newStudent;
    });
  } catch (error) {
    //  Delete uploaded file if DB save fails
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

//  Modify Student
export const modifyStudent = async (studentId, updateData, file, branchFilter, isMaster, adminBranch) => {
  const uploadedFilePath = file ? `/uploads/students/${file.filename}` : null;
  let oldPhotoUrl = null; 

  try {
    const student = await executeTransaction(async (session, isReplicaSet) => {
      const opts = isReplicaSet ? { session } : {};
      
      const targetStudent = await Student.findOne({ _id: studentId, ...branchFilter }, null, opts);
      if (!targetStudent) throw new AppError("Student not found or access denied.", 404);

      if (!isMaster) updateData.branch = adminBranch;

      const oldBatchId = targetStudent.batch?.toString();
      const newBatchId = updateData.batch?.toString();

      // Setup File Replacement
      if (uploadedFilePath) {
        oldPhotoUrl = targetStudent.photo_url;
        updateData.photo_url = uploadedFilePath;
      }

      Object.assign(targetStudent, updateData);
      await targetStudent.save(opts);

      // Handle Batch Change
      if (newBatchId && oldBatchId !== newBatchId) {
        if (oldBatchId) await Batch.findByIdAndUpdate(oldBatchId, { $pull: { students: targetStudent._id } }, opts);
        await Batch.findByIdAndUpdate(newBatchId, { $addToSet: { students: targetStudent._id } }, opts);
      }

      return targetStudent;
    });

    //  Safely delete OLD image only after DB transaction is fully successful
    if (oldPhotoUrl) deleteLocalFile(oldPhotoUrl);
    return student;
    
  } catch (error) {
    // 🔴 Delete the NEW uploaded file if DB save fails
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

//  Fetch All Students
export const fetchAllStudents = async (queryParams, branchFilter) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, parseInt(queryParams.limit) || 30);
  const skip = (page - 1) * limit;

  const { search, status, branch, batch, course, is_active, is_verified, date_from, date_to } = queryParams;

  let match = { ...branchFilter };

  const effectiveBranch = branchFilter?.branch || branch;
  if (effectiveBranch && effectiveBranch !== "all") match.branch = effectiveBranch;
  if (batch && batch !== "all") match.batch = batch;
  if (course && course !== "all") match.course = course;

  if (status && status !== "all") match.status = status;
  if (is_active && is_active !== "all") match.is_active = is_active === "true";
  if (is_verified && is_verified !== "all") match.is_verified = is_verified === "true";

  if (date_from || date_to) {
    match.createdAt = {}; 
    if (date_from) match.createdAt.$gte = new Date(date_from);
    if (date_to) match.createdAt.$lte = new Date(date_to);
  }

  if (search) {
    match.$or = [
      { student_name: { $regex: search, $options: "i" } },
      { student_id: { $regex: search, $options: "i" } },
      { contact_number: { $regex: search, $options: "i" } } 
    ];
  }

  // 🚀 Replaced slow aggregation with optimized populate
  const [students, total] = await Promise.all([
    Student.find(match)
      .populate("course", "course_name course_code")
      .populate("batch", "batch_name")
      .populate("branch", "branch_name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(match)
  ]);

  return {
    students,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

//  Remove Student Permanently
export const removeStudent = async (studentId, branchFilter) => {
  const targetStudent = await Student.findOne({ _id: studentId, ...branchFilter });
  if (!targetStudent) throw new AppError("Student not found or access denied.", 404);

  await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};
    
    await Promise.all([
      Student.deleteOne({ _id: targetStudent._id }, opts),
      Fee.deleteOne({ student: targetStudent._id }, opts),
      Payment.deleteMany({ student: targetStudent._id }, opts),
      targetStudent.batch ? Batch.findByIdAndUpdate(targetStudent.batch, { $pull: { students: targetStudent._id } }, opts) : Promise.resolve()
    ]);
  });

  //  Safely delete image after DB records are destroyed
  if (targetStudent.photo_url) deleteLocalFile(targetStudent.photo_url);
};

//  Utilities & Status Toggles
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

//  Fetch Details & Searches
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
      { contact_number: { $regex: query.trim(), $options: "i" } } 
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

  if (!student || !student.is_active) throw new AppError("Student not found or inactive", 404);
  return student;
};