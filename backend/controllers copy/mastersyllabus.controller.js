import MasterSyllabus from "../models/masterSyllabus.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: createMasterSyllabus]
// ==========================================
export const createMasterSyllabus = catchAsync(async (req, res, next) => {
  // Support for both single object and array (Bulk Insert)
  const data = Array.isArray(req.body) ? req.body : [req.body];
  
  if (!data.length) return next(new AppError("Topic data is required", 400));

  // insertMany handles the array efficiently
  const newTopics = await MasterSyllabus.insertMany(data);
  
  res.status(201).json(new ApiResponse(201, newTopics, "Library updated successfully"));
});

// ==========================================
// 🐳 [Controller: getAllMasterTopics]
// ==========================================
export const getAllMasterTopics = catchAsync(async (req, res, next) => {
  const { category, search } = req.query;
  let filter = {};

  // 🚀 পিডিএফ অনুযায়ী ক্যাটাগরি ফিল্টার (e.g. Continental, Thai, Bakery)
  if (category) {
    filter.category = category;
  }

  // সার্চ লজিক (টপিক এর নাম দিয়ে খোঁজার জন্য)
  if (search) {
    filter.topic = { $regex: search, $options: "i" };
  }

  const topics = await MasterSyllabus.find(filter).sort({ category: 1, topic: 1 });
  
  res.status(200).json(new ApiResponse(200, topics, "Master library fetched successfully"));
});

// ==========================================
// 🐳 [Controller: getSyllabusTopicById]
// ==========================================
export const getSyllabusTopicById = catchAsync(async (req, res, next) => {
  const topic = await MasterSyllabus.findById(req.params.id);
  
  if (!topic) return next(new AppError("Topic not found in library", 404));

  res.status(200).json(new ApiResponse(200, topic, "Topic details fetched"));
});

// ==========================================
// 🐳 [Controller: updateMasterSyllabus]
// ==========================================
export const updateMasterSyllabus = catchAsync(async (req, res, next) => {
  const updatedTopic = await MasterSyllabus.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedTopic) return next(new AppError("Topic not found", 404));

  res.status(200).json(new ApiResponse(200, updatedTopic, "Library topic updated"));
});

// ==========================================
// 🐳 [Controller: deleteMasterSyllabus]
// ==========================================
export const deleteMasterSyllabus = catchAsync(async (req, res, next) => {
  const deletedTopic = await MasterSyllabus.findByIdAndDelete(req.params.id);
  
  if (!deletedTopic) return next(new AppError("Topic not found", 404));

  res.status(200).json(new ApiResponse(200, null, "Topic removed from library"));
});