import * as ReqService from "../services/requisition.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getClassRequisition = catchAsync(async (req, res) => {
  const requisition = await ReqService.getRequisitionByClass(req.params.classId, req.branchFilter);
  res.status(200).json(new ApiResponse(200, requisition, "Requisition fetched successfully"));
});

export const submitRequisition = catchAsync(async (req, res) => {
  const requisition = await ReqService.createRequisition(req.body, req.user._id, req.branchFilter);
  res.status(201).json(new ApiResponse(201, requisition, "Requisition submitted successfully"));
});

export const approveClassRequisition = catchAsync(async (req, res) => {
  const requisition = await ReqService.approveRequisition(req.params.id, req.body, req.user._id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, requisition, "Requisition approved and stock updated"));
});

export const rejectClassRequisition = catchAsync(async (req, res) => {
  const requisition = await ReqService.rejectRequisition(req.params.id, req.body.admin_note, req.user._id, req.branchFilter);
  res.status(200).json(new ApiResponse(200, requisition, "Requisition rejected"));
});

export const getAllRequisitions = catchAsync(async (req, res) => {
  const filter = { ...req.branchFilter };
  
  if (req.query.branch && req.query.branch !== "all") {
    filter.branch = req.query.branch;
  }

  const requisitions = await ReqService.getAllRequisitions(filter);
  res.status(200).json(new ApiResponse(200, requisitions, "All requisitions fetched successfully"));
});