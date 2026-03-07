import mongoose from "mongoose";

const masterSyllabusSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
      unique: true, 
    },
    order_index: {
      type: Number,
      required: true,
    },
    class_type: {
      type: String,
      enum: ["Lecture", "Lab", "Assessment", "Exam", "Review", "Orientation", "Other"],
      default: "Lecture",
    },
    description: {
      type: String,
      trim: true,
    },
    category: { 
      type: String,
      default: "General",
    }
  },
  { timestamps: true }
);

masterSyllabusSchema.index({ order_index: 1 });

export default mongoose.models.MasterSyllabus || mongoose.model("MasterSyllabus", masterSyllabusSchema);