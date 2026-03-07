import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date_string: {
      type: String,
      required: true,
      unique: true, 
    },
    is_active: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Holiday || mongoose.model("Holiday", holidaySchema);