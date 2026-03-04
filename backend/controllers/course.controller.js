import Course from "../models/course.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: createCourse] (CORE CRUD OPERATIONS)
// ==========================================
export const createCourse = catchAsync(async (req, res, next) => {
  // req.body is completely formatted by processCoursePayload
  const course = await Course.create(req.body);

  // 🚀 Using Global Response Handler
  res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

// ==========================================
// 🐳 [Controller: updateCourse]
// ==========================================
export const updateCourse = catchAsync(async (req, res, next) => {
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    return next(new AppError("Course not found", 404));
  }

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, updatedCourse, "Course updated successfully"));
});

// ==========================================
// 🐳 [Controller: deleteCourse]
// ==========================================
export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, null, "Course deleted permanently"));
});

// ==========================================
// 🐳 [Controller: toggleCourseStatus]
// ==========================================
export const toggleCourseStatus = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  course.is_active = !course.is_active;
  await course.save();

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, course, `Course ${course.is_active ? "activated" : "deactivated"} successfully`));
});

// ==========================================
// 🐳 [Controller: getAllCourses] (FETCH & UTILITY)
// ==========================================
export const getAllCourses = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip = (page - 1) * limit;
  const { search, is_active } = req.query;

  let filter = {};

  if (search) {
    filter.$or = [
      { course_name: { $regex: search, $options: "i" } },
      { course_code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (is_active !== undefined) {
    filter.is_active = is_active === "true";
  }

  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);

  const pagination = { total, page, limit, totalPages: Math.ceil(total / limit) };

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully", pagination));
});

// ==========================================
// 🐳 [Controller: getActiveCourses]
// ==========================================
export const getActiveCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ is_active: true }).sort({ course_name: 1 });
  
  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, courses, "Active courses fetched", { count: courses.length }));
});

// ==========================================
// 🐳 [Controller: getCourseById]
// ==========================================
export const getCourseById = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError("Course not found", 404));
  
  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, course, "Course details fetched"));
});

// ==========================================
// 🐳 [Controller: getCourseStats]
// ==========================================
export const getCourseStats = catchAsync(async (req, res, next) => {
  const stats = await Course.aggregate([
    {
      $group: {
        _id: "$is_active",
        count: { $sum: 1 },
        avgDuration: { $avg: "$duration.value" },
      },
    },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: "$count" },
        activeCourses: { $sum: { $cond: [{ $eq: ["$_id", true] }, "$count", 0] } },
        inactiveCourses: { $sum: { $cond: [{ $eq: ["$_id", false] }, "$count", 0] } },
        stats: { $push: "$$ROOT" },
      },
    },
  ]);

  const result = stats[0] || {
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    stats: [],
  };

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, result, "Course statistics fetched"));
});