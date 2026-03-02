import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    description: { 
      type: String 
    },
    permissions: [
      { type: String } // e.g., ["add_student", "view_finance", "edit_inventory"]
    ],
    // System roles (like Superadmin) cannot be deleted from the UI later
    is_system_role: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", roleSchema);