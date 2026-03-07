import * as MasterSyllabusService from "../services/masterSyllabus.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createMasterSyllabus = catchAsync(async (req, res) => {
  const newTopics = await MasterSyllabusService.insertTopics(req.body);
  res.status(201).json(new ApiResponse(201, newTopics, "Library updated successfully"));
});

export const getAllMasterTopics = catchAsync(async (req, res) => {
  const { category, search } = req.query;
  const topics = await MasterSyllabusService.fetchAllTopics(category, search);
  
  res.status(200).json(new ApiResponse(200, topics, "Master library fetched successfully"));
});

export const getSyllabusTopicById = catchAsync(async (req, res) => {
  const topic = await MasterSyllabusService.fetchTopicById(req.params.id);
  res.status(200).json(new ApiResponse(200, topic, "Topic details fetched"));
});

export const updateMasterSyllabus = catchAsync(async (req, res) => {
  const updatedTopic = await MasterSyllabusService.modifyTopic(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, updatedTopic, "Library topic updated"));
});

export const deleteMasterSyllabus = catchAsync(async (req, res) => {
  await MasterSyllabusService.removeTopic(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Topic removed from library"));
});