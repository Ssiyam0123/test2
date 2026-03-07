import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Student from "../models/student.js";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: collectPayment]
// ==========================================
export const collectPayment = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");

  try {
    if (isReplicaSet) session.startTransaction();

    const { fee_record, amount, payment_type, payment_method, transaction_id, remarks } = req.body;
    const payAmt = Number(amount);

    // 🚀 Security: Ensure user can only collect payment for their own branch
    const fee = await Fee.findOne({ _id: fee_record, ...req.branchFilter }).session(session);
    if (!fee) throw new AppError("Fee record not found or access denied.", 404);

    const remaining = fee.net_payable - fee.paid_amount;
    if (payAmt > remaining) throw new AppError(`Overpayment error. Max due: ${remaining}`, 400);

    const [payment] = await Payment.create([{
      fee_record, 
      student: fee.student, 
      branch: fee.branch,
      amount: payAmt, 
      payment_type, 
      payment_method, 
      transaction_id,
      collected_by: req.user._id, 
      remarks
    }], { session });

    fee.paid_amount += payAmt;
    fee.status = fee.paid_amount >= fee.net_payable ? "Paid" : "Partial";
    await fee.save({ session });

    if (isReplicaSet) await session.commitTransaction();

    res.status(201).json(new ApiResponse(201, { payment, fee_summary: fee }, "Payment collected successfully"));
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

// ==========================================
// 🐳 [Controller: getStudentFinance]
// ==========================================
export const getStudentFinance = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;

  // 🚀 Magic: Using branchFilter to restrict access automatically
  const fee_summary = await Fee.findOne({ student: studentId, ...req.branchFilter })
    .populate("course", "course_name base_fee")
    .populate("discount_history.updated_by", "full_name")
    .lean();

  if (!fee_summary) {
    return next(new AppError("Financial record not found or access denied.", 404));
  }

  const transactions = await Payment.find({ student: studentId, ...req.branchFilter })
    .populate("collected_by", "full_name")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { fee_summary, transactions }, "Student finance data fetched"));
});

// ==========================================
// 🐳 [Controller: getCampusFees]
// ==========================================
export const getCampusFees = catchAsync(async (req, res, next) => {
  const { status, search } = req.query;
  
  // 🚀 Start with branch filter from middleware
  let filter = { ...req.branchFilter };

  if (status && status !== "all") filter.status = status;

  if (search) {
    const students = await Student.find({
      ...req.branchFilter, // Search only within the allowed branch
      $or: [
        { student_name: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } }
      ]
    }).select("_id");
    filter.student = { $in: students.map(s => s._id) };
  }

  const fees = await Fee.find(filter)
    .populate("student", "student_name student_id photo_url")
    .populate("course", "course_name")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, fees, "Campus fees fetched successfully"));
});

// ==========================================
// 🐳 [Controller: updateFeeDiscount]
// ==========================================
export const updateFeeDiscount = catchAsync(async (req, res, next) => {
  const { feeId } = req.params;
  const newDiscount = Number(req.body.discount);

  const fee = await Fee.findOne({ _id: feeId, ...req.branchFilter });
  if (!fee) return next(new AppError("Fee record not found or access denied.", 404));

  if (fee.discount === newDiscount) {
    return res.status(200).json(new ApiResponse(200, null, "Discount is already set to this amount."));
  }

  const newNetPayable = fee.total_amount - newDiscount;
  if (newNetPayable < fee.paid_amount) {
    return next(new AppError(`Cannot apply discount. Already paid ৳${fee.paid_amount}.`, 400));
  }

  let newStatus = "Unpaid";
  if (fee.paid_amount >= newNetPayable) newStatus = "Paid";
  else if (fee.paid_amount > 0) newStatus = "Partial";

  const updatedFee = await Fee.findByIdAndUpdate(
    feeId,
    {
      $set: { discount: newDiscount, net_payable: newNetPayable, status: newStatus },
      $push: {
        discount_history: {
          previous_discount: fee.discount || 0,
          new_discount: newDiscount,
          updated_by: req.user._id,
          updated_at: new Date()
        }
      }
    },
    { new: true } 
  );

  res.status(200).json(new ApiResponse(200, updatedFee, "Discount updated successfully."));
});