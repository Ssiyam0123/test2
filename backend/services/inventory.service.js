import mongoose from "mongoose";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
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


export const fetchBranchInventory = async (branchId) => {
  return await Inventory.find({ branch: branchId })
    .sort({ item_name: 1 })
    .lean();
};


export const fetchBranchTransactions = async (branchId) => {
  return await StockTransaction.find({ branch: branchId })
    .populate("inventory_item", "item_name unit")
    .populate({
      path: "performed_by",
      select: "full_name username role",
      populate: { path: "role", select: "name" },
    })
    .populate({
      path: "requested_by",
      select: "full_name username role",
      populate: { path: "role", select: "name" },
    })
    .populate({
      path: "reference_class",
      select: "class_number topic batch instructor",
      populate: [
        { path: "batch", select: "batch_name" },
        { path: "instructor", select: "full_name" },
      ],
    })
    .sort({ createdAt: -1 })
    .lean();
};


export const processStockPurchase = async (branchId, purchaseData, userId) => {
  const { items, total_cost, supplier, notes } = purchaseData;

  await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};

    const inventoryBulkOps = items.map((item) => {
      const itemNameClean = item.item_name.toLowerCase().trim();
      const calculatedUnitPrice = Number(item.total_price) / Number(item.quantity);

      return {
        updateOne: {
          filter: {
            branch: branchId,
            item_name: itemNameClean,
          },
          update: {
            $inc: { quantity_in_stock: Number(item.quantity) },
            $set: { 
              category: item.category, 
              unit: item.unit,
              unit_price: calculatedUnitPrice 
            },
          },
          upsert: true,
        },
      };
    });

    await Inventory.bulkWrite(inventoryBulkOps, opts);

    const updatedInventoryItems = await Inventory.find(
      {
        branch: branchId,
        item_name: { $in: items.map((i) => i.item_name.toLowerCase().trim()) },
      },
      null,
      opts,
    );

    const transactionsToInsert = updatedInventoryItems.map((invItem) => {
      const original = items.find(
        (i) => i.item_name.toLowerCase().trim() === invItem.item_name,
      );
      
      return {
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "PURCHASE",
        quantity: Number(original.quantity),
        total_cost: Number(original.total_price) || 0, 
        supplier: supplier || "Direct Purchase",
        notes: notes || "Stock Inflow via Procurement",
        performed_by: userId,
        requested_by: null, 
        requisition: null,
      };
    });

    await StockTransaction.insertMany(transactionsToInsert, opts);

    if (total_cost > 0) {
      await Expense.create(
        [
          {
            title: `Stock Procurement: ${items.length} items`,
            amount: Number(total_cost),
            branch: branchId,
            recorded_by: userId,
            category: "Inventory",
            date_incurred: new Date()
          },
        ],
        opts,
      );
    }
  });
};