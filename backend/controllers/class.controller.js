import * as ClassService from "../services/class.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getBatchClasses = catchAsync(async (req, res) => {
  const classes = await ClassService.fetchBatchClasses(req.params.batchId, req.branchFilter);
  res.status(200).json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

export const addClassToSyllabus = catchAsync(async (req, res) => {
  const newClasses = await ClassService.insertClassesToSyllabus(req.params.batchId, req.body, req.branchFilter);
  res.status(201).json(new ApiResponse(201, newClasses, `${newClasses.length} classes added`));
});

export const updateClassContent = catchAsync(async (req, res) => {
  const updatedClass = await ClassService.modifyClassContent(req.params.classId, req.body, req.branchFilter);
  res.status(200).json(new ApiResponse(200, updatedClass, "Class updated successfully"));
});

export const deleteClassContent = catchAsync(async (req, res) => {
  await ClassService.removeClassContent(req.params.classId, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "Class deleted successfully"));
});

export const scheduleClass = catchAsync(async (req, res) => {
  const updatedClass = await ClassService.assignClassDate(req.params.classContentId, req.body.date_scheduled, req.branchFilter);
  res.status(200).json(new ApiResponse(200, updatedClass, "Class scheduled"));
});

export const updateClassAttendance = catchAsync(async (req, res) => {
  const updatedClass = await ClassService.recordClassAttendance(req.params.classId, req.body, req.branchFilter, req.user._id);
  res.status(200).json(new ApiResponse(200, updatedClass, "Attendance and costs updated"));
});

export const autoScheduleSyllabus = catchAsync(async (req, res) => {
  await ClassService.generateAutoSchedule(req.params.batchId, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "Calendar generated successfully"));
});