import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: getBranchInventory]
// ==========================================
export const getBranchInventory = catchAsync(async (req, res, next) => {
  // 🚀 Filter by branchId from params but ensure user has access to that branch
  const { branchId } = req.params;
  
  if (!req.isMaster && branchId !== req.user.branch.toString()) {
    return next(new AppError("Access denied to this branch's inventory.", 403));
  }

  const inventory = await Inventory.find({ branch: branchId }).sort({ item_name: 1 });
  
  res.status(200).json(new ApiResponse(200, inventory, "Inventory fetched successfully"));
});

// ==========================================
// 🐳 [Controller: getBranchTransactions]
// ==========================================
export const getBranchTransactions = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;

  if (!req.isMaster && branchId !== req.user.branch.toString()) {
    return next(new AppError("Access denied to these transactions.", 403));
  }

  const transactions = await StockTransaction.find({ branch: branchId })
    .populate("inventory_item", "item_name unit")
    .populate("performed_by", "full_name")
    .populate("reference_class", "class_number topic")
    .sort({ createdAt: -1 });
    
  res.status(200).json(new ApiResponse(200, transactions, "Transactions fetched successfully"));
});

// ==========================================
// 🐳 [Controller: addStockPurchase] (DIRECT STOCK IN)
// ==========================================
export const addStockPurchase = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes('ReplicaSet');

  try {
    if (isReplicaSet) session.startTransaction();

    const { branchId } = req.params;
    const { items, total_cost, supplier, notes } = req.body;
    const userId = req.user._id;

    // 🚀 Security Check
    if (!req.isMaster && branchId !== req.user.branch.toString()) {
      throw new AppError("Unauthorized to purchase for this branch.", 403);
    }

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

    const updatedInventoryItems = await Inventory.find({
      branch: branchId,
      item_name: { $in: items.map(i => i.item_name.toLowerCase().trim()) }
    }).session(isReplicaSet ? session : null);

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

    res.status(201).json(new ApiResponse(201, null, "Pantry updated successfully"));

  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});