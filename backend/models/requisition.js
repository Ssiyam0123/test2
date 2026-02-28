import mongoose from "mongoose";

const requisitionSchema = new mongoose.Schema({
  class_content: { type: mongoose.Schema.Types.ObjectId, ref: "ClassContent", required: true, unique: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, // Crucial for aggregation
  
  items: [{
    item_name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"] }
  }],
  
  budget: { type: Number, default: 0 },
  actual_cost: { type: Number, default: 0 },
  
  status: {
    type: String,
    enum: ["pending", "budgeted", "fulfilled", "partially_fulfilled"],
    default: "pending"
  },
  
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Indexes for fast procurement queries (e.g., "Show me all pending lists for Dhaka")
requisitionSchema.index({ branch: 1, status: 1 });
export default mongoose.model("Requisition", requisitionSchema);