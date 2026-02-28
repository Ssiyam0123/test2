import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    
    total_amount: { type: Number, required: true }, // Copied from Course base_fee
    discount: { type: Number, default: 0 },
    net_payable: { type: Number, required: true }, // total_amount - discount
    paid_amount: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Fee", feeSchema);