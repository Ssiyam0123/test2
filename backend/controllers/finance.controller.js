import * as FinanceService from "../services/finance.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import AppError from "../utils/AppError.js";
import { generateReceiptPDF } from "../services/receipt.service.js";
import { format } from "date-fns";
import Payment from "../models/payment.js"; 
// import axios from "axios"; 

export const downloadPaymentReceipt = catchAsync(async (req, res) => {
  const txn = await Payment.findOne({ _id: req.params.id, ...req.branchFilter })
    .populate("student", "student_name student_id contact_number")
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

export const collectPayment = catchAsync(async (req, res) => {
  const result = await FinanceService.processPayment(
    req.body, 
    req.user._id, 
    req.branchFilter
  );
  
  res.status(201).json(new ApiResponse(201, result, "Payment collected successfully"));
});

export const getStudentFinance = catchAsync(async (req, res) => {
  const financeData = await FinanceService.fetchStudentFinance(
    req.params.studentId, 
    req.branchFilter
  );
  
  res.status(200).json(new ApiResponse(200, financeData, "Student finance data fetched"));
});

export const getCampusFees = catchAsync(async (req, res) => {
  const fees = await FinanceService.fetchCampusFees(
    req.query, 
    req.branchFilter
  );
  
  res.status(200).json(new ApiResponse(200, fees, "Campus fees fetched successfully"));
});

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

// ==========================================
// 📱 SMS Reminder Feature
// ==========================================
export const sendSMSReminder = catchAsync(async (req, res, next) => {
  // 🚀 Fixed: Added customMessage destructuring so modal edits work
  const { studentId, dueAmount, contactNumber, studentName, customMessage } = req.body;

  if (!contactNumber) {
    return next(new AppError("Student contact number is missing.", 400));
  }

  // BD Number Formatting (+8801...)
  let phone = contactNumber.replace(/\s+/g, '');
  if (phone.startsWith("01") && phone.length === 11) {
    phone = "88" + phone;
  }

  // 🚀 Fixed: Use customMessage if provided, else fallback to default
  const message = customMessage || `Dear ${studentName}, this is a reminder from the institute. Your pending fee is BDT ${dueAmount}. Please clear your dues soon. Ignore if already paid.`;

  try {
    const smsApiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID;

    const payload = {
      api_key: apiKey,
      senderid: senderId,
      number: phone,
      message: message
    };

    // 🔴 Uncomment below when your API is ready:
    // await axios.post(smsApiUrl, payload);
    console.log("Mock SMS Sent:", payload);

    res.status(200).json(new ApiResponse(200, null, "SMS reminder sent successfully"));
  } catch (error) {
    console.error("SMS Gateway Error:", error);
    return next(new AppError("Failed to send SMS.", 500));
  }
});