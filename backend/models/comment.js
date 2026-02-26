import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    
    // The instructor (User) who wrote the comment
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, 
    },
  },
  {
    timestamps: true, 
  }
);

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
