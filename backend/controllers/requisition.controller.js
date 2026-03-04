import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import ClassContent from "../models/classContent.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: upsertRequisition]
// ==========================================
export const upsertRequisition = catchAsync(async (req, res, next) => {
  const { class_content, branch, batch, items, budget } = req.body;

  // 🚀 Security: Prevent cross-branch updates for non-admins
  const branchId = req.isMaster ? branch : req.user.branch;

  const requisition = await Requisition.findOneAndUpdate(
    { class_content: class_content }, 
    {
      $set: { 
        branch: branchId, 
        batch, 
        items, 
        budget: budget || 0, 
        requested_by: req.user._id, 
        status: "pending" 
      }
    },
    { 
      new: true, 
      upsert: true, 
      setDefaultsOnInsert: true 
    }
  );

  await ClassContent.findByIdAndUpdate(class_content, { 
    requisition_status: "pending" 
  });

  res.status(200).json(new ApiResponse(200, requisition, "Requisition submitted successfully!"));
});

// ==========================================
// 🐳 [Controller: getPendingRequisitions] 
// ==========================================
export const getPendingRequisitions = catchAsync(async (req, res, next) => {
  const { status } = req.query; 
  
  // 🚀 Magic: Using branchFilter from middleware
  let filter = { ...req.branchFilter };

  if (status && status !== "all") {
    filter.status = status;
  } else {
    filter.status = "pending"; 
  }

  const requisitions = await Requisition.find(filter)
    .populate({ path: "class_content", populate: { path: "instructor", select: "full_name" } })
    .populate("requested_by", "full_name")
    .populate("approved_by", "full_name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, requisitions, "Requisitions fetched successfully"));
});

// ==========================================
// 🐳 [Controller: fulfillRequisition]
// ==========================================
export const fulfillRequisition = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { branchId, reqId } = req.params;
    const { actual_cost } = req.body;
    const userId = req.user._id;

    // 🚀 Security: Ensure the requisition belongs to the correct branch
    const requisition = await Requisition.findOne({ _id: reqId, branch: branchId }).session(session);
    if (!requisition) throw new AppError("Requisition not found or branch mismatch!", 404);

    for (const item of requisition.items) {
      let invItem = await Inventory.findOne({ branch: branchId, item_name: item.item_name.toLowerCase().trim() }).session(session);

      if (!invItem) {
        invItem = new Inventory({
          branch: branchId, 
          item_name: item.item_name.toLowerCase().trim(),
          category: "Other", 
          unit: item.unit, 
          quantity_in_stock: 0
        });
      } else {
        invItem.quantity_in_stock = invItem.quantity_in_stock < item.quantity ? 0 : invItem.quantity_in_stock - item.quantity;
      }
      
      await invItem.save({ session });

      await StockTransaction.create([{
        inventory_item: invItem._id, 
        branch: branchId, 
        transaction_type: "CLASS_USAGE",
        quantity: -item.quantity, 
        performed_by: userId, 
        reference_class: requisition.class_content
      }], { session });
    }

    if (actual_cost > 0) {
      await Expense.create([{
        title: `Bazar for Class (Req ID: ${requisition._id.toString().slice(-4)})`,
        amount: actual_cost, 
        branch: branchId, 
        recorded_by: userId
      }], { session });
    }

    requisition.status = "fulfilled";
    requisition.actual_cost = actual_cost;
    requisition.approved_by = userId;
    await requisition.save({ session });

    await ClassContent.findByIdAndUpdate(requisition.class_content, { requisition_status: "fulfilled" }, { session });

    await session.commitTransaction();
    res.status(200).json(new ApiResponse(200, null, "Requisition approved!"));
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// ==========================================
// 🐳 [Controller: rejectRequisition]
// ==========================================
export const rejectRequisition = catchAsync(async (req, res, next) => {
  const requisition = await Requisition.findOneAndUpdate(
    { _id: req.params.reqId, ...req.branchFilter }, 
    { status: "rejected", approved_by: req.user._id }, 
    { new: true }
  );
  
  if (!requisition) return next(new AppError("Requisition not found or unauthorized.", 404));

  await ClassContent.findByIdAndUpdate(requisition.class_content, { requisition_status: "rejected" });

  res.status(200).json(new ApiResponse(200, null, "Requisition rejected."));
});