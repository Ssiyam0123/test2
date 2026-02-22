import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // The student being commented on
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true, // Added index because we will query "find all comments by student ID" often
    },
    
    // The instructor (User) who wrote the comment
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // The actual comment content
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Good practice to prevent database bloat
    },
  },
  {
    timestamps: true, // Automatically handles createdAt and updatedAt
  }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;