import User from "../models/user.js";
import Role from "../models/role.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import { generateEmployeeId } from "../lib/utils.js";
import AppError from "../utils/AppError.js";

// Fetch Users with Pagination & Filters
export const fetchUsers = async (filters, page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filters)
      .select("-password")
      .populate("branch", "branch_name branch_code")
      .populate("role", "name is_system_role permissions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filters)
  ]);

  return {
    users,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    }
  };
};

// Fetch Single User
export const fetchUserById = async (userId, branchFilter) => {
  const user = await User.findOne({ _id: userId, ...branchFilter })
    .select("-password")
    .populate("branch", "branch_name branch_code")
    .populate("role", "name is_system_role permissions")
    .lean();

  if (!user) throw new AppError("User not found or access denied.", 404);
  return user;
};

// Create New User 
export const createUser = async (userData, file, isMaster, adminBranch) => {
  const uploadedFilePath = file ? `/uploads/employees/${file.filename}` : null;

  try {
    const requestedRole = await Role.findById(userData.role);
    if (!requestedRole) throw new AppError("Invalid role selected.", 400);

    if (!isMaster) {
      userData.branch = adminBranch;
      if (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin") {
        throw new AppError("Action blocked: Cannot create a Master account.", 403);
      }
    }

    if (userData.password === "") delete userData.password;

    if (uploadedFilePath) userData.photo_url = uploadedFilePath;
    userData.employee_id = await generateEmployeeId(requestedRole.name);
    
    userData.social_links = {
      facebook: userData.facebook || "",
      linkedin: userData.linkedin || "",
      twitter: userData.twitter || "",
      instagram: userData.instagram || "",
      custom: userData.others || "",
    };

    delete userData.facebook;
    delete userData.linkedin;
    delete userData.twitter;
    delete userData.instagram;
    delete userData.others;

    const newUser = new User(userData);
    await newUser.save();
    
    const userObj = newUser.toObject();
    delete userObj.password;
    return userObj;

  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

// Modify Existing User
export const modifyUser = async (userId, updateData, file, isMaster, adminBranch, branchFilter) => {
  const uploadedFilePath = file ? `/uploads/employees/${file.filename}` : null;

  try {
    // 🚀 THE MAGIC FIX: added .select("+password") 
    const targetUser = await User.findOne({ _id: userId, ...branchFilter }).select("+password");
    if (!targetUser) throw new AppError("User not found or access denied.", 404);

    if (!isMaster) {
      if (updateData.role && updateData.role.toString() !== targetUser.role.toString()) {
        const requestedRole = await Role.findById(updateData.role);
        if (requestedRole && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
          throw new AppError("Action blocked: Cannot elevate role to Master level.", 403);
        }
      }
      updateData.branch = adminBranch; 
    }

    if (!updateData.password || updateData.password === "") delete updateData.password;

    if (uploadedFilePath) {
      if (targetUser.photo_url) deleteLocalFile(targetUser.photo_url); 
      updateData.photo_url = uploadedFilePath;
    }

    updateData.social_links = {
      facebook: updateData.facebook ?? targetUser.social_links?.facebook ?? "",
      linkedin: updateData.linkedin ?? targetUser.social_links?.linkedin ?? "",
      twitter: updateData.twitter ?? targetUser.social_links?.twitter ?? "",
      instagram: updateData.instagram ?? targetUser.social_links?.instagram ?? "",
      custom: updateData.others ?? targetUser.social_links?.custom ?? "",
    };

    delete updateData.facebook;
    delete updateData.linkedin;
    delete updateData.twitter;
    delete updateData.instagram;
    delete updateData.others;

    Object.assign(targetUser, updateData);
    await targetUser.save(); // 🚀 Now Mongoose won't panic because password is present!

    await targetUser.populate([
      { path: "branch", select: "branch_name branch_code" },
      { path: "role", select: "name is_system_role permissions" }
    ]);

    const userObj = targetUser.toObject();
    delete userObj.password; // সিকিউরিটির জন্য রেসপন্স থেকে আবার ডিলিট করে দিচ্ছি
    return userObj;

  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

// Delete User
export const removeUser = async (userId, branchFilter) => {
  const targetUser = await User.findOne({ _id: userId, ...branchFilter });
  if (!targetUser) throw new AppError("User not found or already deleted.", 404);

  if (targetUser.photo_url) deleteLocalFile(targetUser.photo_url);
  await User.findByIdAndDelete(userId);
};

// Quick Status/Role Toggles
export const changeUserStatus = async (userId, status, branchFilter) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, ...branchFilter },
    { status },
    { new: true }
  ).select("-password");

  if (!user) throw new AppError("User not found or access denied.", 404);
  return user;
};

export const changeUserRole = async (userId, roleId, isMaster, branchFilter) => {
  // 🚀 FIX: added .select("+password") here too, because we call .save() below
  const user = await User.findOne({ _id: userId, ...branchFilter }).select("+password");
  if (!user) throw new AppError("User not found or access denied.", 404);

  const requestedRole = await Role.findById(roleId);
  if (!requestedRole) throw new AppError("Invalid role selected.", 400);

  if (!isMaster && (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin")) {
    throw new AppError("Action blocked: Cannot elevate role to Master level.", 403);
  }

  user.role = roleId;
  await user.save();
  
  await user.populate("role", "name permissions");
  const userObj = user.toObject();
  delete userObj.password;
  
  return { updatedUser: userObj, roleName: requestedRole.name.toUpperCase() };
};

export const deleteUserImage = async (userId, branchFilter) => {
  // 🚀 FIX: added .select("+password") because we call .save() below
  const user = await User.findOne({ _id: userId, ...branchFilter }).select("+password");
  if (!user) throw new AppError("User not found or access denied.", 404);

  if (user.photo_url) deleteLocalFile(user.photo_url);
  user.photo_url = "";
  
  await user.save();
  
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};