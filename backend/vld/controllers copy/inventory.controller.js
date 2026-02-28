import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import mongoose from "mongoose";

export const getBranchInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ branch: req.params.branchId }).sort({ item_name: 1 });
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBranchTransactions = async (req, res) => {
  try {
    const transactions = await StockTransaction.find({ branch: req.params.branchId })
      .populate("inventory_item", "item_name unit")
      .populate("performed_by", "full_name")
      .populate("reference_class", "class_number topic")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// BULK ADD PURCHASE (WITH TRANSACTION)
// ==========================================
export const addStockPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { branchId } = req.params;
    const { items, total_cost, supplier, notes } = req.body;
    const userId = req.user._id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided" });
    }

    const summaryText = [];
    const inventoryBulkOps = [];

    // 1. Prepare Bulk Update for Inventory
    for (const item of items) {
      if (!item.item_name || !item.qty) continue;
      summaryText.push(`${item.qty} ${item.unit} ${item.item_name}`);
      
      inventoryBulkOps.push({
        updateOne: {
          filter: { branch: branchId, item_name: item.item_name.toLowerCase().trim() },
          update: { 
            $inc: { quantity_in_stock: Number(item.qty) },
            $setOnInsert: { category: item.category || "Other", unit: item.unit }
          },
          upsert: true
        }
      });
    }

    // 2. Execute Bulk Inventory Update
    await Inventory.bulkWrite(inventoryBulkOps, { session });

    // 3. Fetch the newly updated/created Inventory IDs to log transactions
    const updatedInventoryItems = await Inventory.find({
      branch: branchId,
      item_name: { $in: items.map(i => i.item_name.toLowerCase().trim()) }
    }).session(session);

    // 4. Prepare & Insert Stock Transactions
    const transactionsToInsert = updatedInventoryItems.map(invItem => {
      const originalReqItem = items.find(i => i.item_name.toLowerCase().trim() === invItem.item_name);
      return {
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "PURCHASE",
        quantity: Number(originalReqItem.qty),
        supplier,
        notes,
        performed_by: userId
      };
    });
    
    await StockTransaction.insertMany(transactionsToInsert, { session });

    // 5. Sync to Global Financial Ledger
    if (Number(total_cost) > 0) {
      await Expense.create([{
        title: `Inventory Restock: ${summaryText.join(", ")}`,
        amount: Number(total_cost),
        branch: branchId,
        recorded_by: userId
      }], { session });
    }

    await session.commitTransaction(); // 🟢 COMMIT EVERYTHING
    res.status(201).json({ success: true, message: "Bulk stock logged successfully" });

  } catch (error) {
    await session.abortTransaction(); // 🔴 ROLLBACK EVERYTHING ON ERROR
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ==========================================
// BULK DEDUCT CLASS REQUISITION
// ==========================================
export const deductClassRequisition = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { branchId, classId } = req.params;
    const { items } = req.body; 
    const userId = req.user._id;

    const inventoryBulkOps = [];

    // 1. Prepare Bulk Deductions
    for (const item of items) {
      if (!item.name || !item.qty) continue;
      inventoryBulkOps.push({
        updateOne: {
          filter: { branch: branchId, item_name: item.name.toLowerCase().trim() },
          update: { 
            $inc: { quantity_in_stock: -Math.abs(Number(item.qty)) },
            $setOnInsert: { unit: item.unit, category: "Other" } 
          },
          upsert: true
        }
      });
    }

    // Execute Bulk Update
    await Inventory.bulkWrite(inventoryBulkOps, { session });

    // 2. Fetch the updated Inventory IDs
    const updatedInventoryItems = await Inventory.find({
      branch: branchId,
      item_name: { $in: items.map(i => i.name.toLowerCase().trim()) }
    }).session(session);

    // 3. Log usage in ledger
    const transactionsToInsert = updatedInventoryItems.map(invItem => {
      const originalReqItem = items.find(i => i.name.toLowerCase().trim() === invItem.item_name);
      return {
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "CLASS_USAGE",
        quantity: -Math.abs(Number(originalReqItem.qty)), 
        performed_by: userId,
        reference_class: classId
      };
    });

    await StockTransaction.insertMany(transactionsToInsert, { session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Requisition deducted from inventory" });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};