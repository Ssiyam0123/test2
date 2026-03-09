import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_name: { type: String, required: true, trim: true },
    fathers_name: { type: String, required: true, trim: true },
    student_id: { type: String, required: true, unique: true, trim: true },
    registration_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    competency: {
      type: String,
      enum: ["competent", "incompetent", "not_assessed"],
      default: "not_assessed",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "discontinued", "on_leave"],
      default: "active",
      required: true,
    },
    is_active: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: false },
    issue_date: { type: Date, required: true },
    completion_date: { type: Date },
    photo_url: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female"], required: true },
    contact_number: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for dashboards/lists
studentSchema.index({ branch: 1, batch: 1, status: 1 });
// Text index for search functionality
studentSchema.index({ student_name: "text" });

studentSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "student",
  options: { limit: 20, sort: { createdAt: -1 } },
});

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
