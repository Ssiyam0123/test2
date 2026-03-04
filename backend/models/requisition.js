import mongoose from "mongoose";

const requisitionSchema = new mongoose.Schema(
  {
    class_content: { type: mongoose.Schema.Types.ObjectId, ref: "ClassContent", required: true, unique: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, 
    items: [
      {
        item_name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true, enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"] },
      },
    ],
    budget: { type: Number, default: 0 },
    actual_cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "rejected"],
      default: "pending",
    },
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// 🚀 Efficient Indexing for fast dashboard loading
requisitionSchema.index({ branch: 1, status: 1 });
requisitionSchema.index({ class_content: 1 });

export default mongoose.model("Requisition", requisitionSchema);