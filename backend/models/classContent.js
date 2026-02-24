import mongoose from "mongoose";

const classContentSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    class_number: { type: Number },
    topic: { type: String },
    content_details: [{ type: String }],
    date_scheduled: { type: Date, default: null },
    is_completed: { type: Boolean, default: false },
    
    // ==========================================
    // UPDATED: Attendance Array
    // ==========================================
    attendance: [
      {
        student: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Student",
          required: true 
        },
        student_name: { 
          type: String, 
          required: true // NEW: Stores the name directly
        },
        status: { 
          type: String, 
          enum: ["present", "absent"], 
          required: true 
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ClassContent", classContentSchema);