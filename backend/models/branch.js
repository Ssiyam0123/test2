import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branch_name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    branch_code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true, 
      trim: true 
    }, 
    address: { type: String, required: true },
    contact_email: { type: String, lowercase: true },
    contact_phone: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

branchSchema.index({ branch_code: 1 });






const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema);
export default Branch;