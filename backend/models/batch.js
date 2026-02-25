import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batch_name: { type: String, required: true, trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    class_contents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ClassContent" },
    ],
    start_date: {
      type: Date,
      required: true,
      validate: {
        validator: (v) => v >= new Date().setHours(0, 0, 0, 0),
        message: "Start date cannot be in the past",
      },
    },
    schedule_days: [
      {
        type: String,
        enum: [
          "Saturday",
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        required: true,
      },
    ],
    time_slot: {
      start_time: { type: String, required: true },
      end_time: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Active", "Upcoming", "Completed", "Inactive"],
      default: "Upcoming",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true, // Crucial for performance as DB grows
    },
  },
  { timestamps: true },
);

// Indexing for faster dashboard filtering
batchSchema.index({ status: 1, start_date: -1 });
batchSchema.index({ course: 1, status: 1 });

// Reference validation
// Reference and Branch-Isolation validation
batchSchema.pre("save", async function (next) {
  if (this.instructor) {
    const instructor = await mongoose
      .model("User")
      .findById(this.instructor)
      .select("branch");
      
    if (!instructor) {
      throw new Error("Referenced Instructor does not exist.");
    }
    
    // Check if the instructor belongs to the same branch as this batch
    if (instructor.branch && instructor.branch.toString() !== this.branch.toString()) {
      throw new Error("Security Violation: Instructor does not belong to this branch.");
    }
  }
  next();
});
// Cascade delete ClassContent when Batch is removed
batchSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    await mongoose.model("ClassContent").deleteMany({ batch: this._id });
    next();
  },
);

export default mongoose.model("Batch", batchSchema);
