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

    start_date: { type: Date, required: true },

    schedule_days: [
      {
        type: String,
        enum: [
          "Saturday", "Sunday", "Monday", "Tuesday", 
          "Wednesday", "Thursday", "Friday",
        ],
        required: true,
      },
    ],

    time_slot: {
      start_time: { type: String, required: true, trim: true },
      end_time: { type: String, required: true, trim: true },
    },

    status: {
      type: String,
      enum: ["Active", "Upcoming", "Completed", "Inactive"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Batch", batchSchema);