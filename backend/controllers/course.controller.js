import * as CourseService from "../services/course.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createCourse = catchAsync(async (req, res) => {
  const course = await CourseService.createCourse(req.body);
  res.status(201).json(new ApiResponse(201, course, "Course created successfully"));
});

export const updateCourse = catchAsync(async (req, res) => {
  const course = await CourseService.modifyCourse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, course, "Course updated successfully"));
});

export const deleteCourse = catchAsync(async (req, res) => {
  await CourseService.removeCourse(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Course deleted permanently"));
});

export const toggleCourseStatus = catchAsync(async (req, res) => {
  const course = await CourseService.switchCourseStatus(req.params.id);
  res.status(200).json(new ApiResponse(200, course, `Course status updated`));
});

export const getAllCourses = catchAsync(async (req, res) => {
  const data = await CourseService.fetchAllCourses(req.query);
  res.status(200).json(new ApiResponse(200, data.courses, "Courses fetched successfully", data.pagination));
});

export const getActiveCourses = catchAsync(async (req, res) => {
  const courses = await CourseService.fetchActiveCourses();
  res.status(200).json(new ApiResponse(200, courses, "Active courses fetched", { count: courses.length }));
});

export const getCourseById = catchAsync(async (req, res) => {
  const course = await CourseService.fetchCourseById(req.params.id);
  res.status(200).json(new ApiResponse(200, course, "Course details fetched"));
});

export const getCourseStats = catchAsync(async (req, res) => {
  const stats = await CourseService.fetchCourseStats();
  res.status(200).json(new ApiResponse(200, stats, "Course statistics fetched"));
});