import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    
    total_amount: { type: Number, required: true }, 
    discount: { type: Number, default: 0 },
    
    // Audit trail for discount overrides
    discount_history: [{
      previous_discount: { type: Number },
      new_discount: { type: Number },
      updated_at: { type: Date, default: Date.now },
      updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }],

    net_payable: { type: Number, required: true }, 
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