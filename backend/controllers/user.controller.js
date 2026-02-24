import User from "../models/user.js";
import { deleteLocalFile } from "../middlewares/multer.js";


import Comment from "../models/comment.js";

export const addComment = async (req, res) => {
  try {
    const { studentId, text } = req.body;
    const instructorId = req.user._id; // Assuming you have protectRoute middleware

    // Security check: Only let instructors or admins comment
    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only instructors and admins can comment." });
    }

    const newComment = await Comment.create({
      student: studentId,
      instructor: instructorId,
      text: text,
    });

    // Populate instructor data before returning so frontend can show their name/photo
    await newComment.populate("instructor", "full_name photo_url designation");

    res.status(201).json({ message: "Comment added", data: newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentComments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const comments = await Comment.find({ student: studentId })
      .populate("instructor", "full_name photo_url designation role") // Fetch the author's details
      .sort({ createdAt: -1 }); // Newest comments first

    res.status(200).json({ data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 1. STANDARD USER / EMPLOYEE CRUD
// ==========================================

// Get all users with pagination and filters
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const { search, status, department, designation, date_from, date_to, role } = req.query;

    let filter = {};

    // Search by Name, Employee ID, Email, Phone, or Username
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

    // Filter by Joining Date
    if (date_from || date_to) {
      filter.joining_date = {};
      if (date_from) filter.joining_date.$gte = new Date(date_from);
      if (date_to) filter.joining_date.$lte = new Date(date_to);
    }

    // Get unique fields for frontend dropdown filters
    const distinctDepartments = await User.distinct("department");
    const distinctDesignations = await User.distinct("designation");
    const distinctStatuses = await User.distinct("status");
    const distinctRoles = await User.distinct("role");

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password") // Security: Don't send passwords
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: {
        departments: distinctDepartments.filter(d => d).sort(),
        designations: distinctDesignations.filter(d => d).sort(),
        statuses: distinctStatuses.filter(s => s).sort(),
        roles: distinctRoles.filter(r => r).sort(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUser = async (req, res) => {
  try {
    // req.body is already fully validated, sanitized, and structured by middlewares
    const user = await User.create(req.body);
    
    const userResponse = user.toObject();
    delete userResponse.password; // Don't send password back

    res.status(201).json({
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);
    if (error.code === 11000) return res.status(400).json({ message: `Duplicate key error` });
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Handle photo replacement server cleanup
    if (req.file && user.photo_url) {
      deleteLocalFile(user.photo_url);
    }

    // Update user using the perfectly structured req.body from middleware
    Object.assign(user, req.body);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User updated successfully",
      data: userResponse,
    });
  } catch (error) {
    if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);
    if (error.code === 11000) return res.status(400).json({ message: `Duplicate key error` });
    res.status(500).json({ message: error.message });
  }
};
// Delete User
export const deleteUser = async (req, res) => {
  try {
    // Prevent an admin from deleting themselves
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

// Fetch a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle User Status (Active/Resigned/On Leave)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

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

// Remove specific user image
export const removeUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.photo_url) deleteLocalFile(user.photo_url);

    user.photo_url = "";
    await user.save();

    res.status(200).json({ message: "Image removed successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin search for users
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
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ message: "Search completed", data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 2. ROLE MANAGEMENT
// ==========================================

export const toggleAdminRole = async (req, res) => {
  try {
    const { role } = req.body; // <-- Get the new role from the dropdown
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-modification
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    // Ensure it's a valid role
    const validRoles = ["admin", "instructor", "register", "staff"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: `Role updated to ${role.toUpperCase()}`, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// user.controller.js

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // Expecting the new role from the dropdown
    
    // Security check: only allow valid roles
    const validRoles = ["admin", "instructor", "register", "staff"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-modification
    if (req.user && req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    user.role = role;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: `Role successfully updated to ${role.toUpperCase()}`, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};