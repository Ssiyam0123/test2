import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[a-zA-Z0-9\s\-&]+$/, "Course name contains invalid characters"],
    },
    course_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9\-]+$/, "Invalid course code format"],
    },
    duration: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        enum: ["days", "months", "years"],
        default: "months",
      },
    },
    base_fee: { 
      type: Number, 
      required: true, 
      default: 0,
      min: [0, "Fee cannot be negative"]
    },
    additional_info: [{ type: String }],
    description: { type: String, default: "", trim: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
