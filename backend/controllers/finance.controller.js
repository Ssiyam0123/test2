import * as FinanceService from "../services/finance.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateReceiptPDF } from "../services/receipt.service.js";
import { format } from "date-fns";
import Payment from "../models/payment.js"; // 🚀 এটা ইম্পোর্ট কর

export const downloadPaymentReceipt = catchAsync(async (req, res) => {
  // 🚀 FIXED: Directly using Payment model instead of FinanceService.Payment
  const txn = await Payment.findOne({ _id: req.params.id, ...req.branchFilter })
    .populate("student", "student_name student_id")
    .populate({ path: "fee_record", populate: { path: "course", select: "course_name" } })
    .populate("collected_by", "full_name")
    .lean();

  if (!txn) throw new AppError("Transaction not found", 404);

  const receiptData = {
    receipt_number: txn.receipt_number,
    date: format(new Date(txn.createdAt), "dd MMM yyyy, hh:mm a"),
    student_name: txn.student?.student_name,
    student_id: txn.student?.student_id,
    course_name: txn.fee_record?.course?.course_name || "N/A",
    payment_type: txn.payment_type,
    payment_method: txn.payment_method,
    amount: txn.amount.toLocaleString(),
    remarks: txn.remarks || "",
    collected_by: txn.collected_by?.full_name || "System"
  };

  const pdfBuffer = await generateReceiptPDF(receiptData);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=Receipt_${txn.receipt_number}.pdf`,
    "Content-Length": pdfBuffer.length
  });

  res.send(pdfBuffer);
});



// 🐳 [Controller: collectPayment]
// ==========================================
export const collectPayment = catchAsync(async (req, res) => {
  const result = await FinanceService.processPayment(
    req.body, 
    req.user._id, 
    req.branchFilter
  );
  
  res.status(201).json(new ApiResponse(201, result, "Payment collected successfully"));
});

// ==========================================
// 🐳 [Controller: getStudentFinance]
// ==========================================
export const getStudentFinance = catchAsync(async (req, res) => {
  const financeData = await FinanceService.fetchStudentFinance(
    req.params.studentId, 
    req.branchFilter
  );
  
  res.status(200).json(new ApiResponse(200, financeData, "Student finance data fetched"));
});

// ==========================================
// 🐳 [Controller: getCampusFees]
// ==========================================
export const getCampusFees = catchAsync(async (req, res) => {
  const fees = await FinanceService.fetchCampusFees(
    req.query, 
    req.branchFilter
  );
  
  res.status(200).json(new ApiResponse(200, fees, "Campus fees fetched successfully"));
});

// ==========================================
// 🐳 [Controller: updateFeeDiscount]
// ==========================================
export const updateFeeDiscount = catchAsync(async (req, res) => {
  const { isUnchanged, fee } = await FinanceService.modifyFeeDiscount(
    req.params.feeId, 
    Number(req.body.discount), 
    req.user._id, 
    req.branchFilter
  );

  const message = isUnchanged 
    ? "Discount is already set to this amount." 
    : "Discount updated successfully.";

  res.status(200).json(new ApiResponse(200, fee, message));
});


