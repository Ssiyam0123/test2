import Comment from "../models/comment.js";
import Student from "../models/student.js";

export const addComment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text } = req.body;
    const instructorId = req.user._id; 

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // 🚀 PBAC Security Check
    const roleName = req.user.role?.name;
    const isAllowed = roleName === "admin" || roleName === "instructor" || req.user.role?.permissions?.includes("all_access");
    
    if (!isAllowed) {
      return res.status(403).json({ message: "Unauthorized to add comments" });
    }

    const newComment = await Comment.create({
      student: studentId,
      instructor: instructorId,
      text: text.trim(),
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      "instructor",
      "full_name photo_url designation"
    );

    res.status(201).json({ message: "Comment added successfully", data: populatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentComments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const comments = await Comment.find({ student: studentId })
      .populate({
         path: "instructor",
         select: "full_name photo_url designation role",
         populate: { path: "role", select: "name" } // Ensure the role name is sent to UI
      })
      .sort({ createdAt: -1 }); 

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};