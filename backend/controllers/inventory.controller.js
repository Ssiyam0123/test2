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



export const addStockPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes('ReplicaSet');

  try {
    if (isReplicaSet) session.startTransaction();

    const { branchId } = req.params;
    const { items, total_cost, supplier, notes } = req.body;
    const userId = req.user._id;

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

    await Inventory.bulkWrite(inventoryBulkOps, isReplicaSet ? { session } : {});

    const query = Inventory.find({
      branch: branchId,
      item_name: { $in: items.map(i => i.item_name.toLowerCase().trim()) }
    });
    const updatedInventoryItems = await (isReplicaSet ? query.session(session) : query);

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
    
    await StockTransaction.insertMany(transactionsToInsert, isReplicaSet ? { session } : {});

    if (total_cost > 0) {
      await Expense.create([{
        title: `Inventory Restock: ${items.length} items`,
        amount: total_cost,
        branch: branchId,
        recorded_by: userId
      }], isReplicaSet ? { session } : {});
    }

    if (isReplicaSet) await session.commitTransaction();
    res.status(201).json({ success: true, message: "Pantry updated successfully" });

  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    console.error("ADD_STOCK_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};


// ==========================================
// DEDUCT CLASS REQUISITION (FIXED)
// ==========================================
export const deductClassRequisition = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { branchId, classId } = req.params;
    const { items } = req.body; 
    const userId = req.user._id;

    const processedInventoryItems = [];

    // 1. Validate Stock Levels BEFORE making any deductions
    for (const item of items) {
      if (!item.name || !item.qty) continue;
      
      const requestedQty = Math.abs(Number(item.qty));

      // Fetch the item within the active transaction session
      const invItem = await Inventory.findOne({ 
        branch: branchId, 
        item_name: item.name.toLowerCase().trim() 
      }).session(session);

      // ERROR: Item doesn't exist at all
      if (!invItem) {
        throw new Error(`Item '${item.name}' does not exist in the pantry.`);
      }

      // ERROR: Not enough stock
      if (invItem.quantity_in_stock < requestedQty) {
        throw new Error(`Insufficient stock for '${item.name}'. Required: ${requestedQty}, Available: ${invItem.quantity_in_stock}`);
      }

      // 2. Safe Deduction (Mongoose schema min:0 validation will also protect this)
      invItem.quantity_in_stock -= requestedQty;
      await invItem.save({ session });
      
      // Push to an array so we can easily create the ledger records below
      processedInventoryItems.push({
        _id: invItem._id,
        item_name: item.name.toLowerCase().trim(),
        deducted_qty: requestedQty
      });
    }

    // 3. Log usage in the Stock Transaction Ledger
    const transactionsToInsert = processedInventoryItems.map(invItem => {
      return {
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "CLASS_USAGE",
        quantity: -invItem.deducted_qty, // Negative because it's a deduction
        performed_by: userId,
        reference_class: classId
      };
    });

    await StockTransaction.insertMany(transactionsToInsert, { session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: "Requisition fulfilled and stock updated." });

  } catch (error) {
    await session.abortTransaction();
    
    // Changing to 400 Bad Request so the frontend toast displays the specific error message
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};