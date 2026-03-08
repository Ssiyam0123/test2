import mongoose from "mongoose";
import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import AppError from "../utils/AppError.js";

// ==========================================
// 🛠️ HELPER: Safe Transaction Execution
// ==========================================
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");

  try {
    if (isReplicaSet) session.startTransaction();
    const result = await callback(session, isReplicaSet);
    if (isReplicaSet) await session.commitTransaction();
    return result;
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getRequisitionByClass = async (classId, branchFilter) => {
  return await Requisition.findOne({ class_content: classId, ...branchFilter })
    .populate("requested_by", "full_name")
    .populate("approved_by", "full_name")
    .lean();
};

export const createRequisition = async (data, userId, branchFilter) => {
  const existingReq = await Requisition.findOne({ class_content: data.class_content });
  if (existingReq) throw new AppError("A requisition already exists for this class.", 400);

  const newReq = new Requisition({
    ...data,
    branch: branchFilter?.branch || data.branch, 
    requested_by: userId,
    status: "pending"
  });

  await newReq.save();
  return newReq;
};

// 🚀 The Magic: Approve & Deduct Stock
export const approveRequisition = async (reqId, payload, adminId, branchFilter) => {
  return await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};

    const requisition = await Requisition.findOne({ _id: reqId, ...branchFilter }, null, opts);
    if (!requisition) throw new AppError("Requisition not found.", 404);
    if (requisition.status !== "pending") throw new AppError(`Requisition is already ${requisition.status}.`, 400);

    const updatedItems = payload.items || requisition.items;
    
    // Process Inventory Deductions
    for (const item of updatedItems) {
      if (!item.is_custom && item.inventory_item) {
        const invItem = await Inventory.findOne({ _id: item.inventory_item, branch: branchFilter.branch }, null, opts);
        if (!invItem) throw new AppError(`Inventory item ${item.item_name} not found.`, 404);
        
        if (invItem.quantity_in_stock < item.quantity) {
          throw new AppError(`Not enough stock for ${item.item_name}. Only ${invItem.quantity_in_stock} ${invItem.unit} left.`, 400);
        }

        // Deduct Stock
        invItem.quantity_in_stock -= item.quantity;
        await invItem.save(opts);

        // Create Stock Transaction Record
        await StockTransaction.create([{
          inventory_item: invItem._id,
          branch: branchFilter.branch,
          transaction_type: "CLASS_USAGE",
          quantity: -Math.abs(item.quantity), // Negative for usage
          performed_by: adminId,
          reference_class: requisition.class_content,
          notes: `Used for Class Requisition`
        }], opts);
      }
    }

    // Mark as Approved
    requisition.items = updatedItems;
    requisition.status = "approved";
    requisition.approved_by = adminId;
    requisition.total_estimated_cost = payload.total_estimated_cost || 0;
    requisition.admin_note = payload.admin_note || "";
    
    await requisition.save(opts);
    return requisition;
  });
};

export const rejectRequisition = async (reqId, adminNote, adminId, branchFilter) => {
  const req = await Requisition.findOneAndUpdate(
    { _id: reqId, ...branchFilter, status: "pending" },
    { status: "rejected", approved_by: adminId, admin_note: adminNote },
    { new: true }
  ).lean(); // 🚀 Lean added for performance

  if (!req) throw new AppError("Requisition not found or already processed.", 404);
  return req;
};

export const getAllRequisitions = async (branchFilter) => {
  return await Requisition.find(branchFilter)
    .populate("class_content", "topic class_number") 
    .populate("batch", "batch_name") 
    .populate("requested_by", "full_name username") 
    .sort({ createdAt: -1 }) 
    .lean();
};