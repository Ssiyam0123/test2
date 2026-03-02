import User from "../models/user.js";
import Role from "../models/role.js"; // 🚀 Added Role Model for dynamic checks
import { deleteLocalFile } from "../middlewares/multer.js";
import { generateEmployeeId } from "../lib/utils.js";

// Helper to check if the current admin has Master Key access
const checkIsMaster = (user) => {
  return user.role?.permissions?.includes("all_access") || user.role?.name === "superadmin";
};

// ==========================================
// READ: MULTI-TENANT FETCH
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      role, 
      department,
      date_from, 
      date_to, 
      search 
    } = req.query;

    let query = { ...req.branchFilter };

    // 2. Standard Filters
    if (status && status !== "all") query.status = status;
    if (role && role !== "all") query.role = role; 
    if (department && department !== "all") query.department = department;

    // 3. Date Range
    if (date_from || date_to) {
      query.joining_date = {};
      if (date_from) query.joining_date.$gte = new Date(date_from);
      if (date_to) query.joining_date.$lte = new Date(date_to);
    }

    // 4. Search Filter
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { employee_id: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .populate("branch", "branch_name branch_code")
      .populate("role", "name is_system_role permissions") 
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// WRITE: MULTI-TENANT CREATE
// ==========================================
export const addUser = async (req, res) => {
  try {
    const userData = { ...req.body };
    const isMaster = checkIsMaster(req.user);

    // Fetch the requested role to prevent privilege escalation
    const requestedRole = await Role.findById(userData.role);
    if (!requestedRole) {
      return res.status(400).json({ success: false, message: "Invalid role selected." });
    }

    // SECURITY OVERRIDE: Branch Isolation & Escalation
    if (!isMaster) {
      userData.branch = req.user.branch;
      
      // Prevent Branch Admins from creating users with "all_access" (Superadmins)
      if (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin") {
        return res.status(403).json({ success: false, message: "Action blocked: You cannot create a Master level account." });
      }
    }

    // File Upload Handling
    if (req.file) {
      userData.photo_url = `/uploads/${req.file.filename}`;
    }

    // Generate ID
    const baseId = await generateEmployeeId(requestedRole.name);
    userData.employee_id = baseId;

    // SOCIAL LINKS NESTING FIX
    userData.social_links = {
      facebook: req.body.facebook || "",
      linkedin: req.body.linkedin || "",
      twitter: req.body.twitter || "",
      instagram: req.body.instagram || "",
      custom: req.body.others || "",
    };

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("ADD_USER_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// WRITE: MULTI-TENANT UPDATE
// ==========================================
// ==========================================
// WRITE: MULTI-TENANT UPDATE
// ==========================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const isMaster = checkIsMaster(req.user);

    // 1. Fetch target user to ensure they exist and check permissions
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // 2. SECURITY GATE: Can this admin edit this user?
    if (!isMaster) {
      // A branch admin cannot edit a user from another branch
      if (targetUser.branch.toString() !== req.user.branch.toString()) {
        return res.status(403).json({ success: false, message: "Access denied to this campus's data." });
      }
      
      // If changing roles, a branch admin cannot elevate someone to superadmin
      if (updateData.role && updateData.role.toString() !== targetUser.role.toString()) {
        const requestedRole = await Role.findById(updateData.role);
        if (requestedRole && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
          return res.status(403).json({ success: false, message: "Action blocked: Cannot elevate role to Master level." });
        }
      }

      // Force the branch ID to remain the admin's branch (prevents unauthorized transfers)
      updateData.branch = req.user.branch;
    }

    // 🚀 FIX 1: Prevent overwriting password with a blank string
    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    }

    // 3. Social Links & Photos
    if (req.file) {
      updateData.photo_url = `/uploads/${req.file.filename}`;
    }

    updateData.social_links = {
      facebook: req.body.facebook || targetUser.social_links?.facebook || "",
      linkedin: req.body.linkedin || targetUser.social_links?.linkedin || "",
      twitter: req.body.twitter || targetUser.social_links?.twitter || "",
      instagram: req.body.instagram || targetUser.social_links?.instagram || "",
      custom: req.body.others || targetUser.social_links?.custom || "",
    };

    // 🚀 FIX 2: Use Object.assign and .save() to trigger the password hashing hook
    Object.assign(targetUser, updateData);
    await targetUser.save(); // This is the magic line that hashes the password

    // Populate data before returning
    await targetUser.populate("branch", "branch_name branch_code");
    await targetUser.populate("role", "name is_system_role permissions");

    res.status(200).json({ success: true, data: targetUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// WRITE: MULTI-TENANT DELETE
// ==========================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isMaster = checkIsMaster(req.user);
    
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // SECURITY GATE
    if (!isMaster && targetUser.branch.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// GET USER BY ID
// ==========================================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("branch", "branch_name branch_code")
      .populate("role", "name is_system_role permissions"); // 🚀 PBAC Populate

    if (!user) return res.status(404).json({ message: "User not found" });

    // Security Gate: Standard admins can't peek into other branches
    const isMaster = checkIsMaster(req.user);
    if (!isMaster && user.branch._id.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// UPDATE STATUS
// ==========================================
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Security Gate
    const isMaster = checkIsMaster(req.user);
    if (!isMaster && user.branch.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const validStatuses = ['Active', 'On Leave', 'Resigned'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status provided" });

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}`, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// REMOVE IMAGE
// ==========================================
export const removeUserImage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Security Gate
    const isMaster = checkIsMaster(req.user);
    if (!isMaster && user.branch.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (user.photo_url) deleteLocalFile(user.photo_url);

    user.photo_url = "";
    await user.save();

    res.status(200).json({ message: "Image removed successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// SEARCH USER
// ==========================================
export const searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.status(400).json({ message: "Search query is required" });

    const searchCriteria = {
      ...req.branchFilter, // 🚀 Uses middleware branch isolation
      $or: [
        { employee_id: { $regex: query.trim(), $options: "i" } },
        { full_name: { $regex: query.trim(), $options: "i" } },
        { email: { $regex: query.trim(), $options: "i" } },
        { username: { $regex: query.trim(), $options: "i" } },
      ],
    };

    const users = await User.find(searchCriteria)
      .select("-password")
      .populate("branch", "branch_name branch_code")
      .populate("role", "name")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ message: "Search completed", data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// QUICK ROLE UPDATE
// ==========================================
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMaster = checkIsMaster(req.user);

    // Security Gate
    if (!isMaster && user.branch.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Verify role isn't elevated to Master
    const requestedRole = await Role.findById(req.body.role);
    if (!requestedRole) return res.status(400).json({ message: "Invalid role selected." });

    if (!isMaster && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
      return res.status(403).json({ success: false, message: "Action blocked: Cannot elevate role to Master level." });
    }

    user.role = req.body.role;
    await user.save();

    // Populate before returning
    await user.populate("role", "name permissions");

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: `Role successfully updated to ${requestedRole.name.toUpperCase()}`, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};