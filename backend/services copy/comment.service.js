import Comment from "../models/comment.js";
import Student from "../models/student.js";
import AppError from "../utils/AppError.js";

export const createComment = async (studentId, text, instructorId, branchFilter) => {
  const student = await Student.findOne({ _id: studentId, ...branchFilter }).lean();
  if (!student) throw new AppError("Student not found or access denied.", 404);

  const newComment = await Comment.create({
    student: studentId,
    instructor: instructorId,
    branch: student.branch,
    text: text.trim()
  });

  return await Comment.findById(newComment._id).populate("instructor", "full_name photo_url designation").lean();
};

export const fetchStudentComments = async (studentId, branchFilter) => {
  const studentExists = await Student.exists({ _id: studentId, ...branchFilter });
  if (!studentExists) throw new AppError("Student not found or access denied.", 404);

  return await Comment.find({ student: studentId })
    .populate({
       path: "instructor",
       select: "full_name photo_url designation role",
       populate: { path: "role", select: "name" } 
    })
    .sort({ createdAt: -1 })
    .lean();
};