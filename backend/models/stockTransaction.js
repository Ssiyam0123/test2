import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    inventory_item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["PURCHASE", "CLASS_USAGE", "WASTE", "ADJUSTMENT"],
      required: true,
    },
    quantity: { type: Number, required: true },
    total_cost: { type: Number, default: 0 },
    supplier: { type: String, trim: true },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reference_class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassContent",
      default: null,
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

stockTransactionSchema.index({ branch: 1, transaction_type: 1, createdAt: -1 });

export default mongoose.models.StockTransaction ||
  mongoose.model("StockTransaction", stockTransactionSchema);
