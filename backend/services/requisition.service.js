import mongoose from "mongoose";
import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js"; // 🚀 NEW: Expense মডেল ইম্পোর্ট করা হলো
import AppError from "../utils/AppError.js";

const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection
    .getClient()
    .topology.description.type.includes("ReplicaSet");

  try {
    if (isReplicaSet) session.startTransaction();
    const result = await callback(session, isReplicaSet);
    if (isReplicaSet) await session.commitTransaction();
    return result;
  } catch (error) {
    if (isReplicaSet && session.inTransaction())
      await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getRequisitionByClass = async (classId, branchFilter) => {
  return await Requisition.find({ class_content: classId, ...branchFilter })
    .populate("requested_by", "full_name")
    .populate("approved_by", "full_name")
    .sort({ createdAt: -1 })
    .lean();
};

export const createRequisition = async (data, userId, branchFilter) => {
  const newReq = new Requisition({
    ...data,
    branch: branchFilter?.branch || data.branch,
    requested_by: userId,
    status: "pending",
  });

  await newReq.save();
  return newReq;
};

// ৩. Approve Requisition with Automatic Expense Logging
export const approveRequisition = async (
  reqId,
  payload,
  adminId,
  branchFilter,
) => {
  return await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};

    const requisition = await Requisition.findOne(
      { _id: reqId, ...branchFilter },
      null,
      opts,
    );
    if (!requisition) throw new AppError("Requisition not found.", 404);
    if (requisition.status !== "pending")
      throw new AppError(`Requisition is already ${requisition.status}.`, 400);

    const updatedItems = payload.items || requisition.items;
    let totalClassCost = 0; // 🚀 খরচ ক্যালকুলেট করার জন্য ভেরিয়েবল

    // Inventory Deductions & Cost Calculation
    for (const item of updatedItems) {
      if (!item.is_custom && item.inventory_item) {
        const invItem = await Inventory.findOne(
          { _id: item.inventory_item, branch: requisition.branch },
          null,
          opts,
        );
        if (!invItem)
          throw new AppError(
            `Inventory item ${item.item_name} not found.`,
            404,
          );

        if (invItem.quantity_in_stock < item.quantity) {
          throw new AppError(`Not enough stock for ${item.item_name}.`, 400);
        }

        // 🚀 খরচ হিসেব: quantity * unit_price (Inventory মডেলে unit_price থাকা বাধ্যতামূলক)
        const itemExpense = item.quantity * (invItem.unit_price || 0);
        totalClassCost += itemExpense;

        invItem.quantity_in_stock -= item.quantity;
        await invItem.save(opts);

        // লেজার ট্রানজেকশন তৈরি
        await StockTransaction.create(
          [
            {
              inventory_item: invItem._id,
              branch: requisition.branch,
              transaction_type: "CLASS_USAGE",
              quantity: -Math.abs(item.quantity),
              total_cost: itemExpense, // ট্রানজেকশনেও খরচ লিখে রাখা হলো
              performed_by: adminId,
              requested_by: requisition.requested_by, 
              requisition: requisition._id,           
              reference_class: requisition.class_content,
              notes: payload.admin_note || `Class Requisition #${requisition._id.toString().slice(-6)}`,
            },
          ],
          opts,
        );
      }
    }

    // 🚀 ৪. যদি খরচ ০ এর বেশি হয়, তবে অটোমেটিক Expense মডেলে ডাটা পুশ করা
    if (totalClassCost > 0) {
      await Expense.create(
        [
          {
            title: `Class Material Cost: ${requisition._id.toString().slice(-6)}`,
            amount: totalClassCost,
            category: "Inventory",
            class_content: requisition.class_content, // 👈 এটাই ড্যাশবোর্ডে ক্লাস অনুযায়ী ডাটা আনবে
            batch: requisition.batch,
            branch: requisition.branch,
            recorded_by: adminId,
            date_incurred: new Date()
          },
        ],
        opts,
      );
    }

    requisition.items = updatedItems;
    requisition.status = "approved";
    requisition.approved_by = adminId;
    requisition.admin_note = payload.admin_note || "";

    await requisition.save(opts);
    return requisition;
  });
};

export const rejectRequisition = async (
  reqId,
  adminNote,
  adminId,
  branchFilter,
) => {
  const req = await Requisition.findOneAndUpdate(
    { _id: reqId, ...branchFilter, status: "pending" },
    { status: "rejected", approved_by: adminId, admin_note: adminNote },
    { new: true },
  ).lean();

  if (!req)
    throw new AppError("Requisition not found or already processed.", 404);
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