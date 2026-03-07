import User from "../models/user.js";
import Role from "../models/role.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import { generateEmployeeId } from "../lib/utils.js";
import AppError from "../utils/AppError.js";

export const fetchUsers = async (filters, page, limit) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(filters)
      .populate("branch", "branch_name branch_code")
      .populate("role", "name is_system_role permissions")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    User.countDocuments(filters)
  ]);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  };
};

export const fetchUserById = async (userId, branchFilter) => {
  const user = await User.findOne({ _id: userId, ...branchFilter })
    .select("-password")
    .populate("branch", "branch_name branch_code")
    .populate("role", "name is_system_role permissions");

  if (!user) throw new AppError("User not found or access denied.", 404);
  return user;
};

export const createUser = async (userData, file, isMaster, adminBranch) => {
  let uploadedFilePath = file ? file.path : null;

  try {
    const requestedRole = await Role.findById(userData.role);
    if (!requestedRole) throw new AppError("Invalid role selected.", 400);

    if (!isMaster) {
      userData.branch = adminBranch;
      if (requestedRole.permissions.includes("all_access") || requestedRole.name === "superadmin") {
        throw new AppError("Action blocked: Cannot create a Master account.", 403);
      }
    }

    if (file) userData.photo_url = `/uploads/employees/${file.filename}`;

    userData.employee_id = await generateEmployeeId(requestedRole.name);
    userData.social_links = {
      facebook: userData.facebook || "",
      linkedin: userData.linkedin || "",
      twitter: userData.twitter || "",
      instagram: userData.instagram || "",
      custom: userData.others || "",
    };

    const newUser = new User(userData);
    await newUser.save();
    
    return newUser;
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

export const modifyUser = async (userId, updateData, file, isMaster, adminBranch, branchFilter) => {
  let uploadedFilePath = file ? file.path : null;

  try {
    const targetUser = await User.findOne({ _id: userId, ...branchFilter });
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

    if (!updateData.password) delete updateData.password;
    if (file) {
      if (targetUser.photo_url) deleteLocalFile(targetUser.photo_url);
      updateData.photo_url = `/uploads/employees/${file.filename}`;
    }

    updateData.social_links = {
      facebook: updateData.facebook ?? targetUser.social_links?.facebook ?? "",
      linkedin: updateData.linkedin ?? targetUser.social_links?.linkedin ?? "",
      twitter: updateData.twitter ?? targetUser.social_links?.twitter ?? "",
      instagram: updateData.instagram ?? targetUser.social_links?.instagram ?? "",
      custom: updateData.others ?? targetUser.social_links?.custom ?? "",
    };

    Object.assign(targetUser, updateData);
    await targetUser.save();

    return await targetUser.populate([
      { path: "branch", select: "branch_name branch_code" },
      { path: "role", select: "name is_system_role permissions" }
    ]);
  } catch (error) {
    if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
    throw error;
  }
};

export const removeUser = async (userId, branchFilter) => {
  const targetUser = await User.findOne({ _id: userId, ...branchFilter });
  if (!targetUser) throw new AppError("User not found or access denied.", 404);

  if (targetUser.photo_url) deleteLocalFile(targetUser.photo_url);
  await User.findByIdAndDelete(userId);
};

export const changeUserStatus = async (userId, status, branchFilter) => {
  const user = await User.findOne({ _id: userId, ...branchFilter }).select("-password");
  if (!user) throw new AppError("User not found or access denied.", 404);

  user.status = status;
  await user.save();
  return user;
};

export const changeUserRole = async (userId, roleId, isMaster, branchFilter) => {
  const user = await User.findOne({ _id: userId, ...branchFilter });
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
  const user = await User.findOne({ _id: userId, ...branchFilter }).select("-password");
  if (!user) throw new AppError("User not found or access denied.", 404);

  if (user.photo_url) deleteLocalFile(user.photo_url);
  user.photo_url = "";
  await user.save();
  return user;
};