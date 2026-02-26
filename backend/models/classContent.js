import mongoose from "mongoose";

const classContentSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    instructor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null 
    },
    class_number: { type: Number },
    topic: { type: String, trim: true, required: true },
    content_details: [{ type: String }],
    date_scheduled: { type: Date, default: null },
    is_completed: { type: Boolean, default: false },
    
    // ==========================================
    // NEW: CLASS FINANCIAL TRACKING
    // ==========================================
    financials: {
      budget: { type: Number, default: 0 }, // Estimated ingredient/material cost
      actual_cost: { type: Number, default: 0 }, // What was actually spent
      expense_notes: { type: String, trim: true }, // E.g., "Bought extra truffles"
    },

    attendance: [
      {
        student: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Student",
          required: true 
        },
        status: { 
          type: String, 
          enum: ["present", "absent"], 
          required: true 
        },
      },
    ],
  },
  { timestamps: true }
);

classContentSchema.index({ batch: 1, date_scheduled: 1 });
classContentSchema.index({ instructor: 1, date_scheduled: 1 });
classContentSchema.index({ is_completed: 1 });

export default mongoose.model("ClassContent", classContentSchema);