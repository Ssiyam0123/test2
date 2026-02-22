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

// Add New User / Employee
export const addUser = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      employee_id, full_name, email, phone, designation, department, 
      joining_date, status, username, password, role,
      facebook, linkedin, twitter, instagram
    } = req.body;

    // Check duplicates including username
    const existingUser = await User.findOne({
      $or: [
        ...(employee_id ? [{ employee_id: employee_id.trim() }] : []),
        { email: { $regex: new RegExp(`^${email?.trim()}$`, "i") } },
        { username: { $regex: new RegExp(`^${username?.trim()}$`, "i") } },
      ],
    });

    if (existingUser) {
      if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);

      if (employee_id && existingUser.employee_id?.toLowerCase() === employee_id.toLowerCase().trim()) {
        return res.status(400).json({ message: `Employee ID "${employee_id}" already exists` });
      }
      if (existingUser.email.toLowerCase() === email.toLowerCase().trim()) {
        return res.status(400).json({ message: `Email "${email}" already exists` });
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase().trim()) {
        return res.status(400).json({ message: `Username "${username}" is already taken` });
      }
    }

    // Validate strictly required fields
    if (!username || !email || !full_name) {
      if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);
      return res.status(400).json({ message: "Username, Email, and Full Name are strictly required" });
    }

    let photo_url = "";
    if (req.file) {
      photo_url = `/uploads/employees/${req.file.filename}`;
      uploadedFilePath = photo_url;
    }

    const userData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      // Use provided password or default to "123456"
      password: password && password.trim() !== "" ? password : "123456", 
      full_name: full_name.trim(),
      employee_id: employee_id ? employee_id.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      designation: designation ? designation.trim() : undefined,
      department: department ? department.trim() : undefined,
      role: role || 'staff',
      status: status || 'Active',
      joining_date: joining_date || Date.now(),
      social_links: {
        facebook: facebook || "",
        linkedin: linkedin || "",
        twitter: twitter || "",
        instagram: instagram || ""
      },
      photo_url,
    };

    const user = await User.create(userData);
    
    // Remove password before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      data: userResponse,
    });
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);

    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      if (req.file) deleteLocalFile(`/uploads/employees/${req.file.filename}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Handle new photo upload
    if (req.file) {
      if (user.photo_url) deleteLocalFile(user.photo_url);
      uploadedFilePath = `/uploads/employees/${req.file.filename}`;
      user.photo_url = uploadedFilePath;
    }

    const {
      employee_id, full_name, email, phone, designation, department, 
      joining_date, status, username, password, role,
      facebook, linkedin, twitter, instagram
    } = req.body;

    // Check for duplicate ID, Email, or Username
    if (employee_id || email || username) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(employee_id ? [{ employee_id: employee_id.trim() }] : []),
          ...(email ? [{ email: email.trim().toLowerCase() }] : []),
          ...(username ? [{ username: username.trim() }] : []),
        ],
      });

      if (existingUser) {
        if (req.file) deleteLocalFile(uploadedFilePath);
        if (employee_id && existingUser.employee_id === employee_id.trim()) return res.status(400).json({ message: "Employee ID already exists" });
        if (email && existingUser.email === email.trim().toLowerCase()) return res.status(400).json({ message: "Email already exists" });
        if (username && existingUser.username === username.trim()) return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Update fields if provided
    if (full_name !== undefined) user.full_name = full_name.trim();
    if (employee_id !== undefined) user.employee_id = employee_id.trim();
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (phone !== undefined) user.phone = phone?.trim();
    if (designation !== undefined) user.designation = designation?.trim();
    if (department !== undefined) user.department = department?.trim();
    if (status !== undefined) user.status = status;
    if (joining_date !== undefined) user.joining_date = joining_date;
    if (username !== undefined) user.username = username.trim();
    if (role !== undefined) user.role = role;
    
    // Only update password if a new one is provided
    if (password && password.trim() !== "") {
      user.password = password;
    }

    // Update Socials
    if (!user.social_links) user.social_links = {};
    if (facebook !== undefined) user.social_links.facebook = facebook.trim();
    if (linkedin !== undefined) user.social_links.linkedin = linkedin.trim();
    if (twitter !== undefined) user.social_links.twitter = twitter.trim();
    if (instagram !== undefined) user.social_links.instagram = instagram.trim();

    try {
      await user.validate();
    } catch (validationError) {
      if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
      return res.status(400).json({ message: validationError.message });
    }

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "User updated successfully",
      data: userResponse,
    });

  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    if (error.code === 11000) return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
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