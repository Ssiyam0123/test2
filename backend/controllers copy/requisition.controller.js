import Requisition from "../models/requisition.js";
import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js";
import ClassContent from "../models/classContent.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: upsertRequisition] (Request Bazar)
// ==========================================
export const upsertRequisition = catchAsync(async (req, res, next) => {
  const { class_content, branch, batch, items, budget } = req.body;

  // 🚀 সুপারঅ্যাডমিন হলে পাঠানো ব্রাঞ্চ আইডি নেবে, নাহলে ইউজারের নিজের ব্রাঞ্চ
  const branchId = req.isMaster ? branch : req.user.branch;

  if (!branchId) return next(new AppError("Branch identification failed.", 400));

  const requisition = await Requisition.findOneAndUpdate(
    { class_content: class_content },
    {
      $set: {
        branch: branchId,
        batch,
        items,
        budget: budget || 0,
        requested_by: req.user._id,
        status: "pending"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  // ক্লাসের স্ট্যাটাস আপডেট
  await ClassContent.findByIdAndUpdate(class_content, { requisition_status: "pending" });

  res.status(200).json(new ApiResponse(200, requisition, "Requisition submitted successfully!"));
});

// ==========================================
// 🐳 [Controller: getPendingRequisitions] 
// ==========================================
export const getPendingRequisitions = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  const { branchId } = req.params; // যদি URL-এ ব্রাঞ্চ আইডি থাকে (মাস্টার ভিউর জন্য)

  let filter = {};

  // ১. সিকিউরিটি ফিল্টার: মাস্টার হলে সব দেখবে (অথবা স্পেসিফিক ব্রাঞ্চ), অ্যাডমিন হলে শুধু নিজের ব্রাঞ্চ
  if (req.isMaster) {
    if (branchId) filter.branch = branchId;
  } else {
    filter.branch = req.user.branch;
  }

  // ২. স্ট্যাটাস ফিল্টার
  if (status && status !== "all") {
    filter.status = status;
  } else {
    filter.status = "pending";
  }

  const requisitions = await Requisition.find(filter)
    .populate({ path: "class_content", populate: { path: "instructor", select: "full_name" } })
    .populate("requested_by", "full_name")
    .populate("approved_by", "full_name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, requisitions, "Requisitions fetched successfully"));
});

// ==========================================
// 🐳 [Controller: fulfillRequisition] (Approve Bazar)
// ==========================================
export const fulfillRequisition = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const { reqId } = req.params;
    const { actual_cost } = req.body;
    const userId = req.user._id;

    // ১. রিকুইজিশন খুঁজে বের করা এবং চেক করা সে এই ব্রাঞ্চের কি না
    const requisition = await Requisition.findById(reqId).session(session);
    if (!requisition) throw new AppError("Requisition not found!", 404);

    // সিকিউরিটি: অ্যাডমিন কি তার নিজের ব্রাঞ্চের রিকুইজিশন অ্যাপ্রুভ করছে?
    if (!req.isMaster && requisition.branch.toString() !== req.user.branch.toString()) {
      throw new AppError("You cannot approve requisitions for another branch.", 403);
    }

    const branchId = requisition.branch;

    // ২. ইনভেন্টরি থেকে আইটেম বিয়োগ করা (Stock OUT)
    for (const item of requisition.items) {
      let invItem = await Inventory.findOne({ 
        branch: branchId, 
        item_name: item.item_name.toLowerCase().trim() 
      }).session(session);

      if (!invItem) {
        // যদি আইটেম আগে না থাকে, ০ স্টক দিয়ে তৈরি হবে (যাতে ট্র্যাকিং থাকে)
        invItem = await Inventory.create([{
          branch: branchId,
          item_name: item.item_name.toLowerCase().trim(),
          category: "Other",
          unit: item.unit,
          quantity_in_stock: 0
        }], { session });
        invItem = invItem[0];
      }

      // স্টক কমানো (০ এর নিচে যাবে না)
      const newQty = Math.max(0, invItem.quantity_in_stock - item.quantity);
      invItem.quantity_in_stock = newQty;
      await invItem.save({ session });

      // ৩. স্টক ট্রানজেকশন রেকর্ড করা
      await StockTransaction.create([{
        inventory_item: invItem._id,
        branch: branchId,
        transaction_type: "CLASS_USAGE",
        quantity: item.quantity, // কতটুকু খরচ হলো
        performed_by: userId,
        reference_class: requisition.class_content
      }], { session });
    }

    // ৪. খরচ (Expense) রেকর্ড করা
    if (actual_cost > 0) {
      await Expense.create([{
        title: `Bazar: ${requisition.items.length} items (Req: ${requisition._id.toString().slice(-4)})`,
        amount: actual_cost,
        branch: branchId,
        recorded_by: userId,
        category: "Bazar"
      }], { session });
    }

    // ৫. রিকুইজিশন এবং ক্লাসের স্ট্যাটাস 'fulfilled' করা
    requisition.status = "fulfilled";
    requisition.actual_cost = actual_cost;
    requisition.approved_by = userId;
    await requisition.save({ session });

    await ClassContent.findByIdAndUpdate(requisition.class_content, { 
      requisition_status: "fulfilled" 
    }, { session });

    await session.commitTransaction();
    res.status(200).json(new ApiResponse(200, null, "Bazar items released from stock and approved."));

  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// ==========================================
// 🐳 [Controller: rejectRequisition]
// ==========================================
export const rejectRequisition = catchAsync(async (req, res, next) => {
  const { reqId } = req.params;

  // অ্যাডমিন শুধু নিজের ব্রাঞ্চেরটা রিজেক্ট করতে পারবে
  const filter = { _id: reqId };
  if (!req.isMaster) filter.branch = req.user.branch;

  const requisition = await Requisition.findOneAndUpdate(
    filter,
    { status: "rejected", approved_by: req.user._id },
    { new: true }
  );

  if (!requisition) return next(new AppError("Requisition not found or unauthorized.", 404));

  await ClassContent.findByIdAndUpdate(requisition.class_content, { requisition_status: "rejected" });

  res.status(200).json(new ApiResponse(200, null, "Requisition has been rejected."));
});