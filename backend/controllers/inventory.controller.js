import * as InventoryService from "../services/inventory.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getBranchInventory = catchAsync(async (req, res) => {

  const inventory = await InventoryService.fetchBranchInventory(req.branchFilter.branch);
  res.status(200).json(new ApiResponse(200, inventory, "Inventory fetched successfully"));
});

export const getBranchTransactions = catchAsync(async (req, res) => {
  const transactions = await InventoryService.fetchBranchTransactions(req.branchFilter.branch);
  res.status(200).json(new ApiResponse(200, transactions, "Transactions fetched successfully"));
});

export const addStockPurchase = catchAsync(async (req, res) => {
  await InventoryService.processStockPurchase(req.branchFilter.branch, req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, null, "Stock updated and Ledger recorded successfully"));
});