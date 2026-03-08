import Comment from "../models/comment.js";
import Student from "../models/student.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: addComment]
// ==========================================
export const addComment = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { text } = req.body;
  const instructorId = req.user._id; 

  if (!text || text.trim() === "") {
    return next(new AppError("Comment text is required", 400));
  }

  // 🚀 Security: Check if student belongs to the instructor's branch (unless master)
  const student = await Student.findOne({ _id: studentId, ...req.branchFilter });
  if (!student) {
    return next(new AppError("Student not found or access denied.", 404));
  }

  const newComment = await Comment.create({
    student: studentId,
    instructor: instructorId,
    branch: student.branch, // Carry over the branch for easier filtering later
    text: text.trim(),
  });

  const populatedComment = await Comment.findById(newComment._id).populate(
    "instructor",
    "full_name photo_url designation"
  );

  res.status(201).json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

// ==========================================
// 🐳 [Controller: getStudentComments]
// ==========================================
export const getStudentComments = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  
  // 🚀 Security: Verify student access first
  const studentExists = await Student.exists({ _id: studentId, ...req.branchFilter });
  if (!studentExists) {
    return next(new AppError("Student not found or access denied.", 404));
  }

  const comments = await Comment.find({ student: studentId })
    .populate({
       path: "instructor",
       select: "full_name photo_url designation role",
       populate: { path: "role", select: "name" } 
    })
    .sort({ createdAt: -1 })
    .lean(); // 🚀 Lean added for performance

  res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// ==========================================
// 🐳 [Controller: deleteComment]
// ==========================================
export const deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError("Comment not found.", 404));
  }

  // 🚀 Security: Only the author or a Master/Superadmin can delete the comment
  if (!req.isMaster && comment.instructor.toString() !== req.user._id.toString()) {
    return next(new AppError("Access denied. You can only delete your own comments.", 403));
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});