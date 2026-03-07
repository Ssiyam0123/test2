import * as StudentService from "../services/student.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export const addStudent = catchAsync(async (req, res) => {
  const student = await StudentService.createStudent(
    req.body, 
    req.file, 
    req.isMaster, 
    req.user.branch
  );
  res.status(201).json(new ApiResponse(201, student, "Student added successfully"));
});

export const updateStudent = catchAsync(async (req, res) => {
  const updatedStudent = await StudentService.modifyStudent(
    req.params.id, 
    req.body, 
    req.file, 
    req.branchFilter, 
    req.isMaster, 
    req.user.branch
  );
  res.status(200).json(new ApiResponse(200, updatedStudent, "Student updated successfully"));
});

export const getAllStudents = catchAsync(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  
  const { search, status, branch, batch, course, is_active, is_verified, date_from, date_to } = req.query;

  let match = {};

  const effectiveBranch = req.branchFilter?.branch || branch;
  if (effectiveBranch && effectiveBranch !== "all") {
    match.branch = new mongoose.Types.ObjectId(effectiveBranch);
  }

  if (batch && batch !== "all") match.batch = new mongoose.Types.ObjectId(batch);
  if (course && course !== "all") match.course = new mongoose.Types.ObjectId(course);

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
      { phone: { $regex: search, $options: "i" } }
    ];
  }

  const { students, pagination } = await StudentService.fetchAllStudents(match, page, limit);

  res.status(200).json(new ApiResponse(200, students, "Students fetched successfully", pagination));
});

export const deleteStudent = catchAsync(async (req, res) => {
  await StudentService.removeStudent(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "Student and all associated records deleted permanently."));
});

export const removeStudentImage = catchAsync(async (req, res) => {
  const student = await StudentService.deleteStudentImage(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, student, "Image removed successfully"));
});

export const toggleStudentStatus = catchAsync(async (req, res) => {
  const student = await StudentService.switchStudentStatus(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, student, `Student ${student.is_active ? "activated" : "deactivated"} successfully`));
});

export const searchStudent = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query?.trim()) return next(new AppError("Search query is required", 400));

  const students = await StudentService.performStudentSearch(query, req.branchFilter);
  res.status(200).json(new ApiResponse(200, students, "Search completed", { count: students.length }));
});

export const getAdminStudentById = catchAsync(async (req, res) => {
  const student = await StudentService.fetchAdminStudentById(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});

export const publicSearchStudent = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query || query.trim() === "") return next(new AppError("Search query is required", 400));

  const student = await StudentService.fetchPublicStudentSearch(query);
  res.status(200).json(new ApiResponse(200, student, "Student found"));
});

export const getPublicStudentById = catchAsync(async (req, res) => {
  const student = await StudentService.fetchPublicStudentById(req.params.id);
  res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});