import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    item_name: { type: String, required: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: [
        "Meat",
        "Dairy",
        "Produce",
        "Dry Goods",
        "Equipment",
        "Packaging",
        "Other",
      ],
      default: "Other",
    },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"],
    },
    quantity_in_stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot go below zero"],
    },
    unit_price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    reorder_threshold: { type: Number, default: 5 },
  },
  { timestamps: true },
);

inventorySchema.index({ branch: 1, item_name: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
