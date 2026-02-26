import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    branch: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Branch", 
      required: true,
      index: true // Crucial for loading a branch's pantry instantly
    },
    item_name: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true // "Chicken" and "chicken" should be the same item
    },
    category: {
      type: String,
      enum: ["Meat", "Dairy", "Produce", "Dry Goods", "Equipment", "Packaging", "Other"],
      default: "Other"
    },
    unit: { 
      type: String, 
      required: true,
      enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"]
    },
    quantity_in_stock: { 
      type: Number, 
      default: 0,
      min: [0, "Stock cannot go below zero"]
    },
    reorder_threshold: { 
      type: Number, 
      default: 5 // Trigger a UI warning if stock drops below this
    }
  },
  { timestamps: true }
);

// A branch cannot have two separate inventory records for the exact same item
inventorySchema.index({ branch: 1, item_name: 1 }, { unique: true });

export default mongoose.model("Inventory", inventorySchema);