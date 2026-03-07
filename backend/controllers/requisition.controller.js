import * as ReqService from "../services/requisition.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
// 🚀 ADD THIS IMPORT
import Requisition from "../models/requisition.js"; 

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

// 🚀 FIXED: Directly use Requisition model here
export const getAllRequisitions = catchAsync(async (req, res) => {
  const requisitions = await Requisition.find(req.branchFilter)
    .populate("class_content", "topic class_number")
    .populate("requested_by", "full_name")
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json(new ApiResponse(200, requisitions, "All requisitions fetched"));
});