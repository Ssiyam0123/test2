import Expense from "../models/expense.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

//  getExpenses
export const getExpenses = catchAsync(async (req, res, next) => {
  const { batchId, classId } = req.query;
  
  let filter = { ...req.branchFilter };

  if (classId) filter.class_content = classId;
  if (batchId) filter.batch = batchId;

  const expenses = await Expense.find(filter)
    .sort({ createdAt: -1 })
    .populate("class_content", "class_number topic")
    .populate("recorded_by", "full_name");

  res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});