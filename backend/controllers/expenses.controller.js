import Expense from "../models/expense.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// ১. সাধারণ খরচের তালিকা (Filterable by Batch/Class)
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

export const getExpenseByClass = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;
  const { batchId } = req.query;

  if (!req.isMaster && branchId !== req.user.branch.toString()) {
    return res.status(403).json(new ApiResponse(403, null, "Unauthorized access"));
  }

  const branchObjectId = new mongoose.Types.ObjectId(branchId);

  const stats = await Expense.aggregate([
    { 
      $match: { 
        branch: branchObjectId, 
        class_content: { $exists: true, $ne: null },
        // যদি ব্যাচ সিলেক্ট করা থাকে তবেই ফিল্টার করবে
        ...(batchId && batchId !== "" ? { batch: new mongoose.Types.ObjectId(batchId) } : {})
      } 
    },
    { 
      $group: { 
        _id: "$class_content", 
        totalCost: { $sum: "$amount" },
        batchId: { $first: "$batch" },
        // প্রতিটি খরচের বিস্তারিত লিস্ট
        breakdown: { 
          $push: { 
            title: "$title", 
            amount: "$amount", 
            date: "$date_incurred" 
          } 
        }
      } 
    },
    { 
      $lookup: { 
        from: "classcontents", // ⚠️ মঙ্গোডিবি কম্পাসে চেক করবি এই নামটা ঠিক আছে কি না
        localField: "_id", 
        foreignField: "_id", 
        as: "classInfo" 
      } 
    },
    { $unwind: "$classInfo" },
    { 
      $project: { 
        _id: 1,
        topic: "$classInfo.topic", 
        class_number: "$classInfo.class_number", 
        batchId: 1,
        totalCost: 1,
        breakdown: 1
      } 
    },
    { $sort: { class_number: 1 } }
  ]);

  res.status(200).json(new ApiResponse(200, stats, "Class-wise stats fetched"));
});