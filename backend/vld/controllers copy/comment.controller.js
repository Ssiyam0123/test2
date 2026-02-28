// controllers/comment.controller.js
import Comment from "../models/comment.js";
import Student from "../models/student.js";

export const addComment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text } = req.body;
    const instructorId = req.user._id; 

    // 1. Validation
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    // 2. Security Check (Only admin or instructor)
    if (req.user.role !== "admin" && req.user.role !== "instructor") {
      return res.status(403).json({ message: "Unauthorized to add comments" });
    }

    // 3. Create Comment
    const newComment = await Comment.create({
      student: studentId,
      instructor: instructorId,
      text: text.trim(),
    });

    // 4. Populate instructor info so the UI can show name/photo immediately
    const populatedComment = await Comment.findById(newComment._id).populate(
      "instructor",
      "full_name photo_url designation"
    );

    res.status(201).json({
      message: "Comment added successfully",
      data: populatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentComments = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const comments = await Comment.find({ student: studentId })
      .populate("instructor", "full_name photo_url designation role")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};