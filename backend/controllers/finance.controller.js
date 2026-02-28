import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Student from "../models/student.js";
import mongoose from "mongoose";

// Helper for Transactions
const getSessionInfo = async () => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");
  return { session, isReplicaSet };
};

// ==========================================
// 1. COLLECT A PAYMENT (INSTALLMENT / ADMISSION)
// ==========================================
export const collectPayment = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();

    const { fee_record, amount, payment_type, payment_method, transaction_id, remarks } = req.body;
    const paymentAmount = Number(amount);

    // 1. Fetch the master fee record
    const fee = await Fee.findById(fee_record).session(session);
    if (!fee) throw new Error("Fee record not found.");

    // Gatekeeper Security Check
    if (req.user.role !== "admin" && req.user.branch.toString() !== fee.branch.toString()) {
      throw new Error("Unauthorized: Cannot collect payments for another campus.");
    }

    // 2. Prevent Overcharging
    const remainingDue = fee.net_payable - fee.paid_amount;
    if (paymentAmount > remainingDue) {
      throw new Error(`Cannot overcharge. Only ৳${remainingDue} is remaining for this student.`);
    }

    // 3. Create the Transaction Receipt
    const [newPayment] = await Payment.create([{
      fee_record: fee._id,
      student: fee.student,
      branch: fee.branch,
      amount: paymentAmount,
      payment_type,
      payment_method,
      transaction_id,
      collected_by: req.user._id,
      remarks
    }], { session });

    // 4. Mathematically Update the Master Fee Record
    fee.paid_amount += paymentAmount;
    
    if (fee.paid_amount >= fee.net_payable) {
      fee.status = "Paid";
    } else {
      fee.status = "Partial";
    }

    await fee.save({ session });

    if (isReplicaSet) await session.commitTransaction();

    res.status(201).json({ 
      success: true, 
      message: "Payment collected successfully.",
      data: {
        payment: newPayment,
        fee_summary: fee
      }
    });

  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ==========================================
// 2. GET SPECIFIC STUDENT FINANCIALS
// ==========================================
export const getStudentFinance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Fetch the Master Invoice
    const fee_summary = await Fee.findOne({ student: studentId })
      .populate("course", "course_name base_fee")
      .lean();

    if (!fee_summary) {
      return res.status(404).json({ success: false, message: "Financial record not found for this student." });
    }

    // Gatekeeper Security Check
    if (req.user.role !== "admin" && req.user.branch.toString() !== fee_summary.branch.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized campus access." });
    }

    // Fetch the Ledger (All Payments)
    const transactions = await Payment.find({ student: studentId })
      .populate("collected_by", "full_name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        fee_summary,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. GET GLOBAL CAMPUS FEE DASHBOARD
// ==========================================
export const getCampusFees = async (req, res) => {
  try {
    const { branch, status, search } = req.query;
    
    // Gatekeeper Security
    const filter = {};
    if (req.user.role !== "admin") {
      filter.branch = req.user.branch; // Branch admin strictly locked
    } else if (branch && branch !== "all") {
      filter.branch = branch; // Superadmin viewing specific branch
    }

    if (status && status !== "all") filter.status = status;

    // If searching, we need to find matching students first
    if (search) {
      const students = await Student.find({
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

    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. UPDATE STUDENT DISCOUNT (MANUAL OVERRIDE)
// ==========================================
export const updateFeeDiscount = async (req, res) => {
  try {
    const { feeId } = req.params;
    const { discount } = req.body;
    const newDiscount = Number(discount);

    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found." });

    // Gatekeeper Check
    if (req.user.role !== "admin" && req.user.branch.toString() !== fee.branch.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized campus access." });
    }

    // Mathematical Validation: Make sure the new discount doesn't make the total due LESS than what they already paid
    const newNetPayable = fee.total_amount - newDiscount;
    if (newNetPayable < fee.paid_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot apply discount. Student has already paid ৳${fee.paid_amount}. This discount would make the total payable ৳${newNetPayable}.` 
      });
    }

    fee.discount = newDiscount;
    fee.net_payable = newNetPayable;

    // Recalculate status just in case the new discount instantly pays off their remaining balance
    if (fee.paid_amount >= fee.net_payable) {
      fee.status = "Paid";
    } else if (fee.paid_amount > 0) {
      fee.status = "Partial";
    } else {
      fee.status = "Unpaid";
    }

    await fee.save();

    res.status(200).json({ success: true, message: "Discount updated successfully.", data: fee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};