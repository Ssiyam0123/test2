import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      default: "Class Requisition & Ingredients" 
    },
    amount: { 
      type: Number, 
      required: true,
      min: [0, "Cost cannot be negative"]
    },
    date_incurred: { 
      type: Date, 
      default: Date.now 
    },
    
    // ⚠️ CHANGED: These are now OPTIONAL. 
    // General inventory purchases won't have these, but class usages will.
    class_content: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ClassContent",
      required: false 
    },
    batch: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Batch",
      required: false,
      index: true 
    },

    branch: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Branch",
      required: true, // Every expense MUST belong to a branch
      index: true 
    },
    
    recorded_by: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  },
  { timestamps: true }
);

// Compound indexes for lightning-fast financial reports and dashboard aggregations
expenseSchema.index({ branch: 1, date_incurred: -1 });
expenseSchema.index({ batch: 1, date_incurred: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;