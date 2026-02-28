import User from "../models/user.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import { generateEmployeeId } from "../lib/utils.js";

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
      branch, 
      date_from, 
      date_to, 
      search 
    } = req.query;

    let query = {};

    // 1. THE SECURITY GATE: Branch Isolation
    if (req.user.role === "superadmin") {
      // Superadmins can see all, OR filter by the branch passed in the query
      if (branch && branch !== "all") {
        query.branch = branch;
      }
    } else {
      // Branch Admins are locked to their own branch permanently
      query.branch = req.user.branch;
    }

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

    // 5. Execute with Pagination
    const users = await User.find(query)
      .populate("branch", "branch_name branch_code")
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

    // File Upload Handling
    if (req.file) {
      userData.photo_url = `/uploads/${req.file.filename}`;
    }

    // Generate ID
    const baseId = await generateEmployeeId(userData.role);
    userData.employee_id = baseId;

    // SOCIAL LINKS NESTING FIX
    userData.social_links = {
      facebook: req.body.facebook || "",
      linkedin: req.body.linkedin || "",
      twitter: req.body.twitter || "",
      instagram: req.body.instagram || "",
      custom: req.body.others || "",
    };

    // SECURITY OVERRIDE: Branch Isolation
    if (req.user.role !== "superadmin") {
      userData.branch = req.user.branch;
      
      // Prevent Branch Admins from creating Superadmins
      if (userData.role === "superadmin") {
        return res.status(403).json({ success: false, message: "Cannot create a superadmin account." });
      }
    }

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
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1. Fetch target user to ensure they exist and check permissions
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // 2. SECURITY GATE: Can this admin edit this user?
    if (req.user.role !== "superadmin") {
      // A branch admin cannot edit a user from another branch
      if (targetUser.branch.toString() !== req.user.branch.toString()) {
        return res.status(403).json({ success: false, message: "Access denied to this branch's data." });
      }
      
      // A branch admin cannot elevate someone to superadmin
      if (updateData.role === "superadmin") {
        return res.status(403).json({ success: false, message: "Cannot elevate role to superadmin." });
      }

      // Force the branch ID to remain the admin's branch (prevents transferring users)
      updateData.branch = req.user.branch;
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

    // 4. Update
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
      .populate("branch", "branch_name branch_code");

    res.status(200).json({ success: true, data: updatedUser });
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
    
    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

    // SECURITY GATE
    if (req.user.role !== "superadmin" && targetUser.branch.toString() !== req.user.branch.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... keep your getUserById, updateUserStatus, updateUserRole, and removeUserImage functions, 
// but make sure to add the `if (req.user.role !== "superadmin" && targetUser.branch.toString() !== req.user.branch.toString())` check to them as well!

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

export const updateUserRole = async (req, res) => {
  try {
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