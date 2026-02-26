import mongoose from "mongoose";

const stockTransactionSchema = new mongoose.Schema(
  {
    inventory_item: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Inventory", 
      required: true 
    },
    branch: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Branch", 
      required: true,
      index: true
    },
    transaction_type: { 
      type: String, 
      enum: ["PURCHASE", "CLASS_USAGE", "WASTE", "ADJUSTMENT"], 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true // e.g., 5 (We bought 5) or -2 (We used 2)
    },
    
    // Financials (Only really used during "PURCHASE")
    total_cost: { 
      type: Number, 
      default: 0 
    },
    supplier: { 
      type: String, 
      trim: true 
    },

    // Accountability
    performed_by: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", // The staff member who bought it or the instructor who used it
      required: true
    },
    reference_class: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "ClassContent", // If transaction_type is CLASS_USAGE, link the class here
      default: null
    },
    notes: { 
      type: String, 
      trim: true 
    }
  },
  { timestamps: true }
);

// Indexes for fast reporting (e.g., "Show me all purchases for Dhaka in February")
stockTransactionSchema.index({ branch: 1, transaction_type: 1, createdAt: -1 });

export default mongoose.model("StockTransaction", stockTransactionSchema);