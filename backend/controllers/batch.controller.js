import * as BatchService from "../services/batch.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createBatch = catchAsync(async (req, res) => {
  const batch = await BatchService.createBatch(req.body, req.isMaster, req.user.branch);
  res.status(201).json(new ApiResponse(201, batch, "Batch created successfully"));
});

export const getAllBatches = catchAsync(async (req, res) => {
  const batches = await BatchService.fetchAllBatches(req.query, req.branchFilter, req.isMaster);
  res.status(200).json(new ApiResponse(200, batches, "Batches fetched successfully"));
});

export const getBatchById = catchAsync(async (req, res) => {
  const batch = await BatchService.fetchBatchById(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, batch, "Batch details fetched"));
});

export const updateBatch = catchAsync(async (req, res) => {
  const batch = await BatchService.modifyBatch(req.params.id, req.body, req.branchFilter);
  res.status(200).json(new ApiResponse(200, batch, "Batch updated successfully"));
});

export const deleteBatch = catchAsync(async (req, res) => {
  await BatchService.removeBatch(req.params.id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, null, "Batch and syllabus deleted permanently"));
});