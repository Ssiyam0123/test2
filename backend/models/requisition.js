import mongoose from "mongoose";

const requisitionSchema = new mongoose.Schema(
  {
    class_content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassContent",
      required: true,
      // unique: true সরিয়ে ফেলা হয়েছে যাতে এক ক্লাসে অনেক রিকুইজিশন দেওয়া যায়
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    items: [
      {
        inventory_item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          default: null,
        },
        item_name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        unit: {
          type: String,
          required: true,
          enum: ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"],
        },
        is_custom: { type: Boolean, default: false },
      },
    ],
    // total_estimated_cost ফিল্ডটি ডিলিট করা হয়েছে
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "delivered"],
      default: "pending",
      index: true,
    },
    requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    admin_note: { type: String, trim: true },
  },
  { timestamps: true },
);

// ইন্ডেক্স আপডেট
requisitionSchema.index({ class_content: 1 });

export default mongoose.model("Requisition", requisitionSchema);