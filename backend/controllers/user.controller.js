import User from "../models/user.js";
import Role from "../models/role.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import { generateEmployeeId } from "../lib/utils.js";
import catchAsync from "../utils/catchAsync.js"; 
import AppError from "../utils/AppError.js"; 
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: getAllUsers] (READ: MULTI-TENANT FETCH)
// ==========================================
export const getAllUsers = catchAsync(async (req, res, next) => {
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

  // 🚀 Magic: Auto branch filter applied from middleware
  let query = { ...req.branchFilter };

  if (status && status !== "all") query.status = status;
  if (role && role !== "all") query.role = role; 
  if (department && department !== "all") query.department = department;

  if (date_from || date_to) {
    query.joining_date = {};
    if (date_from) query.joining_date.$gte = new Date(date_from);
    if (date_to) query.joining_date.$lte = new Date(date_to);
  }

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

  const pagination = {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
  };

  res.status(200).json(new ApiResponse(200, users, "Users fetched successfully", pagination));
});

// ==========================================
// 🐳 [Controller: addUser] (WRITE: MULTI-TENANT CREATE)
// ==========================================
export const addUser = catchAsync(async (req, res, next) => {
  let uploadedFilePath = req.file ? req.file.path : null;

  try {
    const userData = { ...req.body };

    const requestedRole = await Role.findById(userData.role);
    if (!requestedRole) {
      throw new AppError("Invalid role selected.", 400);
    }

    // 🚀 Using req.isMaster injected by auth.js
    if (!req.isMaster) {
      userData.branch = req.user.branch; // Force set admin's branch
      
      if (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin") {
        throw new AppError("Action blocked: You cannot create a Master level account.", 403);
      }
    }

    if (req.file) {
      userData.photo_url = `/uploads/${req.file.filename}`;
    }

    const baseId = await generateEmployeeId(requestedRole.name);
    userData.employee_id = baseId;

    userData.social_links = {
      facebook: req.body.facebook || "",
      linkedin: req.body.linkedin || "",
      twitter: req.body.twitter || "",
      instagram: req.body.instagram || "",
      custom: req.body.others || "",
    };

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    return next(error);
  }
});

// ==========================================
// 🐳 [Controller: updateUser] (WRITE: MULTI-TENANT UPDATE)
// ==========================================
export const updateUser = catchAsync(async (req, res, next) => {
  let uploadedFilePath = req.file ? req.file.path : null;

  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 🚀 Magic: Auto branch isolation using req.branchFilter
    const targetUser = await User.findOne({ _id: id, ...req.branchFilter });
    if (!targetUser) throw new AppError("User not found or access denied.", 404);

    if (!req.isMaster) {
      if (updateData.role && updateData.role.toString() !== targetUser.role.toString()) {
        const requestedRole = await Role.findById(updateData.role);
        if (requestedRole && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
          throw new AppError("Action blocked: Cannot elevate role to Master level.", 403);
        }
      }
      updateData.branch = req.user.branch; // Prevent moving to another branch
    }

    if (!updateData.password || updateData.password.trim() === "") {
      delete updateData.password;
    }

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

    Object.assign(targetUser, updateData);
    await targetUser.save(); 

    await targetUser.populate("branch", "branch_name branch_code");
    await targetUser.populate("role", "name is_system_role permissions");

    res.status(200).json(new ApiResponse(200, targetUser, "User updated successfully"));
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    return next(error);
  }
});

// ==========================================
// 🐳 [Controller: deleteUser] (WRITE: MULTI-TENANT DELETE)
// ==========================================
export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // 🚀 Magic: Auto branch isolation
  const targetUser = await User.findOne({ _id: id, ...req.branchFilter });
  if (!targetUser) return next(new AppError("User not found or access denied.", 404));

  if (targetUser.photo_url) deleteLocalFile(targetUser.photo_url);

  await User.findByIdAndDelete(id);
  
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

// ==========================================
// 🐳 [Controller: getUserById]
// ==========================================
export const getUserById = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation
  const user = await User.findOne({ _id: req.params.id, ...req.branchFilter })
    .select("-password")
    .populate("branch", "branch_name branch_code")
    .populate("role", "name is_system_role permissions");

  if (!user) return next(new AppError("User not found or access denied.", 404));

  res.status(200).json(new ApiResponse(200, user, "User details fetched"));
});

// ==========================================
// 🐳 [Controller: updateUserStatus]
// ==========================================
export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  // 🚀 Magic: Auto branch isolation
  const user = await User.findOne({ _id: req.params.id, ...req.branchFilter }).select("-password");
  if (!user) return next(new AppError("User not found or access denied.", 404));

  const validStatuses = ['Active', 'On Leave', 'Resigned'];
  if (!validStatuses.includes(status)) {
    return next(new AppError("Invalid status provided", 400));
  }

  user.status = status;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, `User status updated to ${status}`));
});

// ==========================================
// 🐳 [Controller: removeUserImage]
// ==========================================
export const removeUserImage = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation
  const user = await User.findOne({ _id: req.params.id, ...req.branchFilter }).select("-password");
  if (!user) return next(new AppError("User not found or access denied.", 404));

  if (user.photo_url) deleteLocalFile(user.photo_url);

  user.photo_url = "";
  await user.save();

  res.status(200).json(new ApiResponse(200, user, "Image removed successfully"));
});

// ==========================================
// 🐳 [Controller: searchUser]
// ==========================================
export const searchUser = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  if (!query || query.trim() === "") {
    return next(new AppError("Search query is required", 400));
  }

  // 🚀 Magic: Auto branch isolation
  const searchCriteria = {
    ...req.branchFilter, 
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

  res.status(200).json(new ApiResponse(200, users, "Search completed", { count: users.length }));
});

// ==========================================
// 🐳 [Controller: updateUserRole]
// ==========================================
export const updateUserRole = catchAsync(async (req, res, next) => {
  // 🚀 Magic: Auto branch isolation
  const user = await User.findOne({ _id: req.params.id, ...req.branchFilter });
  if (!user) return next(new AppError("User not found or access denied.", 404));

  const requestedRole = await Role.findById(req.body.role);
  if (!requestedRole) return next(new AppError("Invalid role selected.", 400));

  if (!req.isMaster && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
    return next(new AppError("Action blocked: Cannot elevate role to Master level.", 403));
  }

  user.role = req.body.role;
  await user.save();

  await user.populate("role", "name permissions");

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json(new ApiResponse(200, userResponse, `Role successfully updated to ${requestedRole.name.toUpperCase()}`));
});