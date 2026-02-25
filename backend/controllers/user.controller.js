import User from "../models/user.js";
import Comment from "../models/comment.js";
import { deleteLocalFile } from "../middlewares/multer.js";

// ==========================================
// COMMENTS LOGIC
// ==========================================
export const addComment = async (req, res) => {
  try {
    const { studentId, text } = req.body;
    const instructorId = req.user._id;

    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only instructors and admins can comment." });
    }

    const newComment = await Comment.create({ student: studentId, instructor: instructorId, text });
    await newComment.populate("instructor", "full_name photo_url designation");

    res.status(201).json({ message: "Comment added", data: newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentComments = async (req, res) => {
  try {
    const comments = await Comment.find({ student: req.params.studentId })
      .populate("instructor", "full_name photo_url designation role")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// STANDARD USER / EMPLOYEE CRUD
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const { search, status, department, designation, date_from, date_to, role } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { employee_id: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "all") filter.status = status;
    if (department && department !== "all") filter.department = department;
    if (designation && designation !== "all") filter.designation = designation;
    if (role && role !== "all") filter.role = role;

    if (date_from || date_to) {
      filter.joining_date = {};
      if (date_from) filter.joining_date.$gte = new Date(date_from);
      if (date_to) filter.joining_date.$lte = new Date(date_to);
    }

    const [users, total, distinctDepartments, distinctDesignations, distinctStatuses, distinctRoles] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
      User.distinct("department"),
      User.distinct("designation"),
      User.distinct("status"),
      User.distinct("role"),
    ]);

    res.status(200).json({
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: {
        departments: distinctDepartments.filter(Boolean).sort(),
        designations: distinctDesignations.filter(Boolean).sort(),
        statuses: distinctStatuses.filter(Boolean).sort(),
        roles: distinctRoles.filter(Boolean).sort(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: "User created successfully", data: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Handle photo replacement server cleanup
    if (req.file && user.photo_url) deleteLocalFile(user.photo_url);

    Object.assign(user, req.body);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: "User updated successfully", data: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.photo_url) deleteLocalFile(user.photo_url);

    await user.deleteOne();
    res.status(200).json({ message: "User deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const validStatuses = ['Active', 'On Leave', 'Resigned'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status provided" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}`, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.photo_url) deleteLocalFile(user.photo_url);

    user.photo_url = "";
    await user.save();

    res.status(200).json({ message: "Image removed successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.status(400).json({ message: "Search query is required" });

    const users = await User.find({
      $or: [
        { employee_id: { $regex: query.trim(), $options: "i" } },
        { full_name: { $regex: query.trim(), $options: "i" } },
        { email: { $regex: query.trim(), $options: "i" } },
        { username: { $regex: query.trim(), $options: "i" } },
      ],
    }).select("-password").sort({ createdAt: -1 }).limit(20);

    res.status(200).json({ message: "Search completed", data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ROLE MANAGEMENT
// ==========================================
export const updateUserRole = async (req, res) => {
  try {
    // req.body.role and self-modification are already checked by validateRoleUpdate middleware
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: `Role successfully updated to ${req.body.role.toUpperCase()}`, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};