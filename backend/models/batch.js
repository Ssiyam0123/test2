import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batch_name: { type: String, required: true, trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // CHANGED: Now an array of references
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
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
      index: true,
    },
  },
  { timestamps: true },
);

// Indexing for faster dashboard filtering
batchSchema.index({ status: 1, start_date: -1 });
batchSchema.index({ course: 1, status: 1 });

// Reference and Branch-Isolation validation for MULTIPLE instructors
batchSchema.pre("save", async function (next) {
  if (this.instructors && this.instructors.length > 0) {
    try {
      // Fetch all instructors in the array at once
      const instructorsData = await mongoose
        .model("User")
        .find({ _id: { $in: this.instructors } })
        .select("branch");
        
      // Ensure we found the exact number of instructors requested
      if (instructorsData.length !== this.instructors.length) {
        return next(new Error("One or more referenced Instructors do not exist."));
      }
      
      // Check branch isolation for each instructor
      for (const instructor of instructorsData) {
        if (instructor.branch && this.branch && instructor.branch.toString() !== this.branch.toString()) {
          return next(new Error(`Security Violation: An assigned instructor does not belong to this branch.`));
        }
      }
      
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next(); // Move on if no instructors are assigned yet
  }
});

// Cascade delete ClassContent when Batch is removed
batchSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await mongoose.model("ClassContent").deleteMany({ batch: this._id });
      next();
    } catch (err) {
      next(err);
    }
  },
);

export default mongoose.model("Batch", batchSchema);