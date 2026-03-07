import mongoose from "mongoose";

const requisitionSchema = new mongoose.Schema(
  {
    class_content: { type: mongoose.Schema.Types.ObjectId, ref: "ClassContent", required: true, unique: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true }, 
    
    items: [
      {
        // 🚀 If it's an existing inventory item, we store the ID for auto-deduction
        inventory_item: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", default: null },
        
        item_name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true, enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"] },
        
        // 🚀 If true, this is a "Shopping List" item (not in stock)
        is_custom: { type: Boolean, default: false } 
      },
    ],
    
    // 🚀 Manager/Admin can adjust total estimated cost when approving
    total_estimated_cost: { type: Number, default: 0 },
    
    // 🚀 Status workflow updated
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "delivered"],
      default: "pending",
      index: true
    },
    
    requested_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    
    // Optional note from admin when rejecting or approving
    admin_note: { type: String, trim: true }
  },
  { timestamps: true }
);

// Efficient Indexing
requisitionSchema.index({ class_content: 1 });

export default mongoose.model("Requisition", requisitionSchema);