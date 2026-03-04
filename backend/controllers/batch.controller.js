import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: createBatch]
// ==========================================
export const createBatch = catchAsync(async (req, res, next) => {
  const batchData = { ...req.body };
  
  // 🚀 Security: Ensure Branch Admins can only create batches for their branch
  if (!req.isMaster) {
    batchData.branch = req.user.branch;
  }

  const newBatch = await Batch.create(batchData);
  res.status(201).json(new ApiResponse(201, newBatch, "Batch created successfully"));
});

// ==========================================
// 🐳 [Controller: getAllBatches]
// ==========================================
export const getAllBatches = catchAsync(async (req, res, next) => {
  const { status, branch } = req.query;
  
  // 🚀 Magic: Automatic branch filter
  let query = { ...req.branchFilter };

  if (req.isMaster && branch && branch !== "all") {
    query.branch = branch;
  }

  if (status && status !== "all") query.status = status;

  const batches = await Batch.find(query)
    .populate("course", "course_name")
    .populate("branch", "branch_name branch_code")
    .populate("students", "student_name student_id photo_url")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, batches, "Batches fetched"));
});

// ==========================================
// 🐳 [Controller: getBatchById]
// ==========================================
export const getBatchById = catchAsync(async (req, res, next) => {
  const batch = await Batch.findOne({ _id: req.params.id, ...req.branchFilter })
    .populate("course")
    .populate("instructors", "full_name email photo_url")
    .populate("branch", "branch_name branch_code")
    .populate("students", "student_name student_id photo_url");

  if (!batch) return next(new AppError("Batch not found or unauthorized.", 404));

  res.status(200).json(new ApiResponse(200, batch, "Batch details fetched"));
});

// ==========================================
// 🐳 [Controller: updateBatch]
// ==========================================
export const updateBatch = catchAsync(async (req, res, next) => {
  const updatedBatch = await Batch.findOneAndUpdate(
    { _id: req.params.id, ...req.branchFilter },
    req.body,
    { new: true, runValidators: true }
  ).populate("course", "course_name");

  if (!updatedBatch) return next(new AppError("Batch not found or unauthorized.", 404));

  res.status(200).json(new ApiResponse(200, updatedBatch, "Batch updated"));
});

// ==========================================
// 🐳 [Controller: deleteBatch]
// ==========================================
export const deleteBatch = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const batch = await Batch.findOne({ _id: id, ...req.branchFilter });
  if (!batch) return next(new AppError("Batch not found or unauthorized.", 404));

  // Cascade delete syllabus
  await ClassContent.deleteMany({ batch: id });
  await Batch.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, "Batch and syllabus deleted"));
});