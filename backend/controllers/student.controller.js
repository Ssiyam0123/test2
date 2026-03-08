import * as StudentService from "../services/student.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";

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
  const { students, pagination } = await StudentService.fetchAllStudents(req.query, req.branchFilter);
  res.status(200).json(new ApiResponse(200, students, "Students fetched successfully", pagination));
});

export const deleteStudent = catchAsync(async (req, res) => {
  await StudentService.removeStudent(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "Student and associated records deleted permanently"));
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
  if (!query?.trim()) return next(new AppError("Search query is required", 400));

  const student = await StudentService.fetchPublicStudentSearch(query);
  res.status(200).json(new ApiResponse(200, student, "Student found"));
});

export const getPublicStudentById = catchAsync(async (req, res) => {
  const student = await StudentService.fetchPublicStudentById(req.params.id);
  res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});