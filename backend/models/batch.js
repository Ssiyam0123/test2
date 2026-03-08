import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batch_name: { type: String, required: true, trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    class_contents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ClassContent" },
    ],
    start_date: { type: Date, required: true },
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
    },
  },
  { timestamps: true },
);

batchSchema.index({ branch: 1, status: 1 });
batchSchema.index({ course: 1, branch: 1 });

batchSchema.pre("save", async function (next) {
  if (this.instructors && this.instructors.length > 0) {
    try {
      const instructorsData = await mongoose
        .model("User")
        .find({ _id: { $in: this.instructors } })
        .select("branch");

      if (instructorsData.length !== this.instructors.length) {
        return next(
          new Error("One or more referenced Instructors do not exist."),
        );
      }

      for (const instructor of instructorsData) {
        if (
          instructor.branch &&
          this.branch &&
          instructor.branch.toString() !== this.branch.toString()
        ) {
          return next(
            new Error(
              `Security Violation: An assigned instructor does not belong to this branch.`,
            ),
          );
        }
      }
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});

// Auto-delete related classes when batch is deleted
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

export default mongoose.models.Batch || mongoose.model("Batch", batchSchema);
