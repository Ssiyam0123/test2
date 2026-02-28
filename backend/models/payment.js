import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    fee_record: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    
    amount: { type: Number, required: true },
    payment_type: { type: String, enum: ["Admission Fee", "Installment", "Other"], required: true },
    payment_method: { type: String, enum: ["Cash", "Mobile Banking", "Bank Transfer", "Card"], required: true },
    
    transaction_id: { type: String }, 
    receipt_number: { type: String, unique: true, required: true },
    collected_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    remarks: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

paymentSchema.pre("validate", function (next) {
  if (!this.receipt_number) {
    this.receipt_number = `RCPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Payment", paymentSchema);