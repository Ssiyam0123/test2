import mongoose from "mongoose";
import User from "../models/user.js";
import Role from "../models/role.js";
import AppError from "../utils/AppError.js";

// 🚀 Response Formatter
export const formatUserResponse = (user) => {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role, 
    photo_url: user.photo_url,
    branch: user.branch,
    status: user.status
  };
};

export const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email })
    .select("+password")
    .populate("role")
    .populate("branch"); 
  
  if (!user) throw new AppError("Invalid credentials", 400);
  if (user.status !== "Active") throw new AppError("Account restricted.", 403);

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new AppError("Invalid credentials", 400);

  return user;
};

export const fetchAuthenticatedUser = async (userId) => {
  const user = await User.findById(userId)
    .populate("role")
    .populate("branch"); 

  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const registerNewUser = async (userData) => {
  const { username, email, password, full_name, employee_id, phone, designation, department, branch, role } = userData;

  // 🚀 Check for duplicates
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }, { employee_id }] 
  }).select("email username employee_id").lean();

  if (existingUser) {
    if (existingUser.email === email) throw new AppError("Email already exists", 400);
    if (existingUser.username === username) throw new AppError("Username already exists", 400);
    if (existingUser.employee_id === employee_id) throw new AppError("Employee ID already exists", 400);
  }

  // 🚀 Resolve Role ID
  let roleId = role;
  if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
    const dbRole = await Role.findOne({ name: roleId || "instructor" }).lean();
    if (dbRole) roleId = dbRole._id;
  }

  // 🚀 Create User
  const user = new User({
    email, username, password, full_name, employee_id,
    phone, designation: designation || "Staff", department: department || "General",
    branch, role: roleId, status: "Active"
  });

  await user.save();
  
  return await User.findById(user._id).populate("role").populate("branch");
};




