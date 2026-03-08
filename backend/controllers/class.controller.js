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
  // 🚀 FIXED: req.params.classId হবে, classContentId না!
  const updatedClass = await ClassService.assignClassDate(req.params.classId, req.body.date_scheduled, req.branchFilter);
  res.status(200).json(new ApiResponse(200, updatedClass, "Class scheduled"));
});

export const autoScheduleSyllabus = catchAsync(async (req, res) => {
  const result = await ClassService.generateAutoSchedule(req.params.batchId, req.branchFilter);
  res.status(200).json(new ApiResponse(200, result, "Calendar generated successfully"));
});

// 🚀 FIXED: The missing Controller function that connects to your Service
export const updateClassAttendance = catchAsync(async (req, res) => {
  const classId = req.params.classId; 
  const branchFilter = req.branchFilter || {};
  const userId = req.user ? req.user._id : null; 

  const updatedClass = await ClassService.recordClassAttendance(
    classId, 
    req.body, 
    branchFilter, 
    userId
  );

  res.status(200).json(new ApiResponse(200, updatedClass, "Attendance recorded successfully!"));
});