
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    student_name: {
      type: String,
      required: true,
      trim: true,
    },
    fathers_name: {
      type: String,
      required: true,
      trim: true,
    },
    student_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    registration_number: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    course_name: {
      type: String,
      required: true,
      trim: true,
    },

    course_code: {
      type: String,
      required: true,
      trim: true,
    },

    course_duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["days" ,"months", "years"],
        default: "months",
      },
    },

    competency: {
      type: String,
      enum: ["competent", "incompetent", "not_assessed"], 
      required: true,
    },

    batch: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed", "discontinued", "on_leave"],
      default: "active",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    issue_date: {
      type: Date,
      required: true,
    },

    completion_date: {
      type: Date,
    },
    photo_url: {
      type: String,
      default: "",
    },
    gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },

    contact_number: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);


studentSchema.index({
  student_id: 1,
  registration_number: 1,
});

studentSchema.index({
  batch: 1,
  status: 1,
});

studentSchema.virtual('comments', {
  ref: 'Comment',          // The model to use
  localField: '_id',       // Find comments where `localField`
  foreignField: 'student', // is equal to `foreignField`
});

// Important: Ensure virtuals are included when converting to JSON
studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON', { virtuals: true });

const Student = mongoose.model("Student", studentSchema);

export default Student;
