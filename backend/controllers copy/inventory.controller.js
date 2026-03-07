import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🛠️ সাহায্যকারী ফাংশন: ব্রাঞ্চ এক্সেস চেক
// ==========================================
const validateBranchAccess = (req, branchId) => {
  if (req.isMaster) return true;
  
  if (req.user.branch && req.user.branch.toString() === branchId) {
    return true;
  }

  return false;
};

// ==========================================
// 🐳 [Controller: getBranchInventory]
// ==========================================
export const getBranchInventory = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;

  if (!validateBranchAccess(req, branchId)) {
    return next(new AppError("আপনি শুধু আপনার নিজের ব্রাঞ্চের ইনভেন্টরি দেখতে পারবেন।", 403));
  }

  const inventory = await Inventory.find({ branch: branchId }).sort({ item_name: 1 });
  res.status(200).json(new ApiResponse(200, inventory, "Inventory fetched successfully"));
});

// ==========================================
// 🐳 [Controller: getBranchTransactions] (FIXED FOR FRONTEND)
// ==========================================
export const getBranchTransactions = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;

  if (!validateBranchAccess(req, branchId)) {
    return next(new AppError("এই ট্রানজেকশনগুলো দেখার অনুমতি আপনার নেই।", 403));
  }

  const transactions = await StockTransaction.find({ branch: branchId })
    .populate("inventory_item", "item_name unit")
    // ১. Accepted By (Admin/System) এর নাম ও রোল পপুলেট করা হচ্ছে
    .populate({
      path: "performed_by",
      select: "full_name role",
      populate: { path: "role", select: "name" } 
    })
    // ২. 🚀 THE FIX: Class, Batch এবং Instructor এর নাম ডিপ পপুলেট করা হচ্ছে
    .populate({
      path: "reference_class",
      select: "class_number topic batch instructor",
      populate: [
        { path: "batch", select: "batch_name" },
        { path: "instructor", select: "full_name" } // 👈 এখান থেকেই ইন্সট্রাক্টরের নাম ফ্রন্টএন্ডে যাবে
      ]
    })
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

    if (!validateBranchAccess(req, branchId)) {
      throw new AppError("আপনি অন্য ব্রাঞ্চের হয়ে কেনাকাটা এন্ট্রি করতে পারবেন না।", 403);
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
        title: `Stock Entry: ${items.length} items`,
        amount: total_cost,
        branch: branchId,
        recorded_by: userId,
        category: "Inventory" 
      }], isReplicaSet ? { session } : {});
    }

    if (isReplicaSet) await session.commitTransaction();
    res.status(201).json(new ApiResponse(201, null, "Stock updated and Ledger recorded successfully"));

  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});