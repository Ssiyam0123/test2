import mongoose from "mongoose";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import AppError from "../utils/AppError.js";

// Helper for conditional transactions (local vs replica set)
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes('ReplicaSet');

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

export const fetchBranchInventory = async (branchId) => {
  return await Inventory.find({ branch: branchId }).sort({ item_name: 1 }).lean();
};

export const fetchBranchTransactions = async (branchId) => {
  return await StockTransaction.find({ branch: branchId })
    .populate("inventory_item", "item_name unit")
    .populate({
      path: "performed_by",
      select: "full_name role",
      populate: { path: "role", select: "name" } 
    })
    .populate({
      path: "reference_class",
      select: "class_number topic batch instructor",
      populate: [
        { path: "batch", select: "batch_name" },
        { path: "instructor", select: "full_name" } 
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
};

export const processStockPurchase = async (branchId, purchaseData, userId) => {
  const { items, total_cost, supplier, notes } = purchaseData;

  await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};

    // 1. Bulk Update Inventory
    const inventoryBulkOps = items.map(item => ({
      updateOne: {
        filter: { branch: branchId, item_name: item.item_name.toLowerCase().trim() },
        update: {
          $inc: { quantity_in_stock: item.quantity },
          $set: { category: item.category, unit: item.unit }
        },
        upsert: true
      }
    }));

    await Inventory.bulkWrite(inventoryBulkOps, opts);

    // 2. Fetch updated items to get their ObjectIds for the transactions
    const updatedInventoryItems = await Inventory.find({
      branch: branchId,
      item_name: { $in: items.map(i => i.item_name.toLowerCase().trim()) }
    }, null, opts);

    // 3. Create Stock Transactions
    const transactionsToInsert = updatedInventoryItems.map(invItem => {
      const original = items.find(i => i.item_name.toLowerCase().trim() === invItem.item_name);
      return {
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "PURCHASE",
        quantity: original.quantity,
        total_cost: original.total_price || 0,
        supplier,
        notes,
        performed_by: userId
      };
    });

    await StockTransaction.insertMany(transactionsToInsert, opts);

    // 4. Record Expense Ledger
    if (total_cost > 0) {
      await Expense.create([{
        title: `Stock Entry: ${items.length} items`,
        amount: total_cost,
        branch: branchId,
        recorded_by: userId,
        category: "Inventory" 
      }], opts);
    }
  });
};