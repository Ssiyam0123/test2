import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    course_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["days", "months", "years"], // <-- ADDED "days"
        default: "months",
      },
    },
    additional_info: {
      type: [String],
      default: [],
      // REMOVED: enum: ["haccp&hygiene", "city&guild", "nsda"] 
      // Removing the enum allows the frontend to send custom string tags freely
    },
    description: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Course = mongoose.model("Course", courseSchema);

export default Course;