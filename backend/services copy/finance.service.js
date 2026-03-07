import mongoose from "mongoose";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Student from "../models/student.js";
import AppError from "../utils/AppError.js";

// 🛠️ HELPER: Conditional Transaction Execution
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");

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

export const processPayment = async (paymentData, userId, branchFilter) => {
  return await executeTransaction(async (session, isReplicaSet) => {
    const opts = isReplicaSet ? { session } : {};
    const payAmt = Number(paymentData.amount);

    const fee = await Fee.findOne({ _id: paymentData.fee_record, ...branchFilter }, null, opts);
    if (!fee) throw new AppError("Fee record not found or access denied.", 404);

    const remaining = fee.net_payable - fee.paid_amount;
    if (payAmt > remaining) throw new AppError(`Overpayment error. Max due: ${remaining}`, 400);

    const [payment] = await Payment.create([{
      fee_record: paymentData.fee_record, 
      student: fee.student, 
      branch: fee.branch,
      amount: payAmt, 
      payment_type: paymentData.payment_type, 
      payment_method: paymentData.payment_method, 
      transaction_id: paymentData.transaction_id,
      collected_by: userId, 
      remarks: paymentData.remarks
    }], opts);

    fee.paid_amount += payAmt;
    fee.status = fee.paid_amount >= fee.net_payable ? "Paid" : "Partial";
    await fee.save(opts);

    return { payment, fee_summary: fee };
  });
};

export const fetchStudentFinance = async (studentId, branchFilter) => {
  const fee_summary = await Fee.findOne({ student: studentId, ...branchFilter })
    .populate("course", "course_name base_fee")
    .populate("discount_history.updated_by", "full_name")
    .lean();

  if (!fee_summary) throw new AppError("Financial record not found or access denied.", 404);

  const transactions = await Payment.find({ student: studentId, ...branchFilter })
    .populate("collected_by", "full_name")
    .sort({ createdAt: -1 })
    .lean();

  return { fee_summary, transactions };
};

export const fetchCampusFees = async (queryParams, branchFilter) => {
  const { status, search } = queryParams;
  let filter = { ...branchFilter };

  if (status && status !== "all") filter.status = status;

  if (search) {
    const students = await Student.find({
      ...branchFilter,
      $or: [
        { student_name: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } }
      ]
    }).select("_id").lean();
    
    filter.student = { $in: students.map(s => s._id) };
  }

  return await Fee.find(filter)
    .populate("student", "student_name student_id photo_url")
    .populate("course", "course_name")
    .sort({ createdAt: -1 })
    .lean();
};

export const modifyFeeDiscount = async (feeId, newDiscount, userId, branchFilter) => {
  const fee = await Fee.findOne({ _id: feeId, ...branchFilter });
  if (!fee) throw new AppError("Fee record not found or access denied.", 404);

  if (fee.discount === newDiscount) {
    return { isUnchanged: true, fee };
  }

  const newNetPayable = fee.total_amount - newDiscount;
  if (newNetPayable < fee.paid_amount) {
    throw new AppError(`Cannot apply discount. Already paid ৳${fee.paid_amount}.`, 400);
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
          updated_by: userId,
          updated_at: new Date()
        }
      }
    },
    { new: true } 
  );

  return { isUnchanged: false, fee: updatedFee };
};