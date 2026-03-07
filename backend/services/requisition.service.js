import mongoose from "mongoose";
import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import AppError from "../utils/AppError.js";

// Transaction Helper
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
  return await executeTransaction(async (session) => {
    const requisition = await Requisition.findOne({ _id: reqId, ...branchFilter }).session(session);
    if (!requisition) throw new AppError("Requisition not found.", 404);
    if (requisition.status !== "pending") throw new AppError(`Requisition is already ${requisition.status}.`, 400);

    // Update quantities based on admin's edit (if any)
    const updatedItems = payload.items || requisition.items;
    
    // Process Inventory Deductions
    for (const item of updatedItems) {
      if (!item.is_custom && item.inventory_item) {
        // Find item in inventory
        const invItem = await Inventory.findOne({ _id: item.inventory_item, branch: branchFilter.branch }).session(session);
        if (!invItem) throw new AppError(`Inventory item ${item.item_name} not found.`, 404);
        
        if (invItem.quantity_in_stock < item.quantity) {
          throw new AppError(`Not enough stock for ${item.item_name}. Only ${invItem.quantity_in_stock} ${invItem.unit} left.`, 400);
        }

        // Deduct Stock
        invItem.quantity_in_stock -= item.quantity;
        await invItem.save({ session });

        // Create Stock Transaction Record
        await StockTransaction.create([{
          inventory_item: invItem._id,
          branch: branchFilter.branch,
          transaction_type: "CLASS_USAGE",
          quantity: -Math.abs(item.quantity), // Negative for usage
          performed_by: adminId,
          reference_class: requisition.class_content,
          notes: `Used for Class Requisition`
        }], { session });
      }
    }

    // Mark as Approved
    requisition.items = updatedItems;
    requisition.status = "approved";
    requisition.approved_by = adminId;
    requisition.total_estimated_cost = payload.total_estimated_cost || 0;
    requisition.admin_note = payload.admin_note || "";
    
    await requisition.save({ session });
    return requisition;
  });
};

export const rejectRequisition = async (reqId, adminNote, adminId, branchFilter) => {
  const req = await Requisition.findOneAndUpdate(
    { _id: reqId, ...branchFilter, status: "pending" },
    { status: "rejected", approved_by: adminId, admin_note: adminNote },
    { new: true }
  );
  if (!req) throw new AppError("Requisition not found or already processed.", 404);
  return req;
};



// সব রিকুইজিশন ব্রাঞ্চ অনুযায়ী ফেচ করার সার্ভিস
export const getAllRequisitions = async (branchFilter) => {
  return await Requisition.find(branchFilter)
    .populate("class_content", "topic class_number") // ক্লাসের নাম ও নম্বর দেখানোর জন্য
    .populate("batch", "batch_name") // কোন ব্যাচ তা জানার জন্য
    .populate("requested_by", "full_name username") // কে রিকোয়েস্ট করেছে
    .sort({ createdAt: -1 }) // নতুনগুলো আগে দেখাবে
    .lean();
};