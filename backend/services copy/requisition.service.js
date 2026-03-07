import mongoose from "mongoose";
import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import ClassContent from "../models/classContent.js";
import AppError from "../utils/AppError.js";

const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const createOrUpdateRequisition = async (reqData, userId, isMaster, adminBranch) => {
  const branchId = isMaster ? reqData.branch : adminBranch;
  if (!branchId) throw new AppError("Branch identification failed.", 400);

  const requisition = await Requisition.findOneAndUpdate(
    { class_content: reqData.class_content },
    {
      $set: {
        branch: branchId,
        batch: reqData.batch,
        items: reqData.items,
        budget: reqData.budget || 0,
        requested_by: userId,
        status: "pending"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await ClassContent.findByIdAndUpdate(reqData.class_content, { requisition_status: "pending" });
  return requisition;
};

export const fetchPendingRequisitions = async (isMaster, adminBranch, targetBranchId, status) => {
  let filter = {};

  if (isMaster) {
    if (targetBranchId) filter.branch = targetBranchId;
  } else {
    filter.branch = adminBranch;
  }

  filter.status = (status && status !== "all") ? status : "pending";

  return await Requisition.find(filter)
    .populate({ path: "class_content", populate: { path: "instructor", select: "full_name" } })
    .populate("requested_by", "full_name")
    .populate("approved_by", "full_name")
    .sort({ createdAt: -1 });
};

export const approveRequisition = async (reqId, actualCost, userId, isMaster, adminBranch) => {
  return await executeTransaction(async (session) => {
    const requisition = await Requisition.findById(reqId).session(session);
    if (!requisition) throw new AppError("Requisition not found!", 404);

    if (!isMaster && requisition.branch.toString() !== adminBranch.toString()) {
      throw new AppError("You cannot approve requisitions for another branch.", 403);
    }

    const branchId = requisition.branch;

    // Process Inventory Items
    for (const item of requisition.items) {
      let invItem = await Inventory.findOne({ 
        branch: branchId, 
        item_name: item.item_name.toLowerCase().trim() 
      }).session(session);

      if (!invItem) {
        invItem = await Inventory.create([{
          branch: branchId,
          item_name: item.item_name.toLowerCase().trim(),
          category: "Other",
          unit: item.unit,
          quantity_in_stock: 0
        }], { session });
        invItem = invItem[0];
      }

      // 🚀 Bug Fix: Throw error instead of just making it 0 silently
      if (invItem.quantity_in_stock < item.quantity) {
          throw new AppError(`Insufficient stock for '${item.item_name}'. Required: ${item.quantity}, Available: ${invItem.quantity_in_stock}`, 400);
      }

      invItem.quantity_in_stock -= item.quantity;
      await invItem.save({ session });

      await StockTransaction.create([{
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "CLASS_USAGE",
        quantity: item.quantity,
        performed_by: userId,
        reference_class: requisition.class_content
      }], { session });
    }

    if (actualCost > 0) {
      await Expense.create([{
        title: `Bazar: ${requisition.items.length} items (Req: ${requisition._id.toString().slice(-4)})`,
        amount: actualCost,
        branch: branchId,
        recorded_by: userId,
        category: "Bazar"
      }], { session });
    }

    requisition.status = "fulfilled";
    requisition.actual_cost = actualCost;
    requisition.approved_by = userId;
    await requisition.save({ session });

    await ClassContent.findByIdAndUpdate(requisition.class_content, { 
      requisition_status: "fulfilled" 
    }, { session });
  });
};

export const declineRequisition = async (reqId, userId, isMaster, adminBranch) => {
  const filter = { _id: reqId };
  if (!isMaster) filter.branch = adminBranch;

  const requisition = await Requisition.findOneAndUpdate(
    filter,
    { status: "rejected", approved_by: userId },
    { new: true }
  );

  if (!requisition) throw new AppError("Requisition not found or unauthorized.", 404);

  await ClassContent.findByIdAndUpdate(requisition.class_content, { requisition_status: "rejected" });
  return requisition;
};