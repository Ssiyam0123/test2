import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Student from "../models/student.js";
import mongoose from "mongoose";

const getSessionInfo = async () => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection.getClient().topology.description.type.includes("ReplicaSet");
  return { session, isReplicaSet };
};

export const collectPayment = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();

    const { fee_record, amount, payment_type, payment_method, transaction_id, remarks } = req.body;
    const payAmt = Number(amount);

    const fee = await Fee.findById(fee_record).session(session);
    if (!fee) throw new Error("Ledger not found.");

    if (req.user.role !== "superadmin" && req.user.role !== "admin" && req.user.branch.toString() !== fee.branch.toString()) {
      throw new Error("Unauthorized branch access.");
    }

    const remaining = fee.net_payable - fee.paid_amount;
    if (payAmt > remaining) throw new Error(`Overpayment error. Max due: ${remaining}`);

    const [payment] = await Payment.create([{
      fee_record, student: fee.student, branch: fee.branch,
      amount: payAmt, payment_type, payment_method, transaction_id,
      collected_by: req.user._id, remarks
    }], { session });

    fee.paid_amount += payAmt;
    fee.status = fee.paid_amount >= fee.net_payable ? "Paid" : "Partial";
    await fee.save({ session });

    if (isReplicaSet) await session.commitTransaction();
    res.status(201).json({ success: true, data: { payment, fee_summary: fee } });
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getStudentFinance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const fee_summary = await Fee.findOne({ student: studentId })
      .populate("course", "course_name base_fee")
      .populate("discount_history.updated_by", "full_name")
      .lean();

    if (!fee_summary) {
      return res.status(404).json({ success: false, message: "Financial record not found for this student." });
    }

    if (
      req.user.role !== "superadmin" && 
      req.user.role !== "admin" && 
      req.user.branch?.toString() !== fee_summary.branch.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized campus access." });
    }

    const transactions = await Payment.find({ student: studentId })
      .populate("collected_by", "full_name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: { fee_summary, transactions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampusFees = async (req, res) => {
  try {
    const { branch, status, search } = req.query;
    const filter = {};
    
    if (req.user.role !== "superadmin" && req.user.role !== "admin") {
      filter.branch = req.user.branch; 
    } else if (branch && branch !== "all") {
      filter.branch = branch; 
    }

    if (status && status !== "all") filter.status = status;

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
// 4. UPDATE STUDENT DISCOUNT (BULLETPROOF DB WRITE)
// ==========================================
export const updateFeeDiscount = async (req, res) => {
  try {
    const { feeId } = req.params;
    const newDiscount = Number(req.body.discount);

    // 1. Fetch current data
    const fee = await Fee.findById(feeId);
    if (!fee) return res.status(404).json({ success: false, message: "Fee record not found." });

    // Gatekeeper Security
    if (req.user.role !== "superadmin" && req.user.role !== "admin" && req.user.branch.toString() !== fee.branch.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized campus access." });
    }

    // 2. Prevent identical saves
    if (fee.discount === newDiscount) {
      return res.status(200).json({ 
        success: true, 
        message: "Discount is already set to this amount. No changes made." 
      });
    }

    // 3. Mathematical Validations
    const newNetPayable = fee.total_amount - newDiscount;
    if (newNetPayable < fee.paid_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot apply discount. Student has already paid ৳${fee.paid_amount}.` 
      });
    }

    // 4. Recalculate Payment Status
    let newStatus = "Unpaid";
    if (fee.paid_amount >= newNetPayable) newStatus = "Paid";
    else if (fee.paid_amount > 0) newStatus = "Partial";

    // 5. DIRECT DB INJECTION ($set and $push guarantee it saves)
    const updatedFee = await Fee.findByIdAndUpdate(
      feeId,
      {
        $set: {
          discount: newDiscount,
          net_payable: newNetPayable,
          status: newStatus
        },
        $push: {
          discount_history: {
            previous_discount: fee.discount || 0,
            new_discount: newDiscount,
            updated_by: req.user._id,
            updated_at: new Date()
          }
        }
      },
      { new: true } // Returns the updated document immediately
    );

    res.status(200).json({ 
      success: true, 
      message: "Discount applied and audit log updated.", 
      data: updatedFee 
    });
    
  } catch (error) {
    console.error("Discount DB Write Error:", error);
    res.status(500).json({ success: false, message: "Server error applying discount." });
  }
};