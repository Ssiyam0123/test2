import { generateToken } from "../lib/genToken.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import Branch from "../models/branch.js"; // 🚀 এই ইমপোর্টটা মাস্ট লাগবে
import mongoose from "mongoose";

// 🚀 রেসপন্স পাঠানোর হেল্পার ফাংশন
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role, 
    photo_url: user.photo_url,
    branch: user.branch, // 🚀 populate হওয়ার পর এটা অবজেক্ট হয়ে যাবে
    status: user.status
  };
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🚀 এখানে খেয়াল কর, .populate("branch") দেওয়া আছে
    const user = await User.findOne({ email })
      .select("+password")
      .populate("role")
      .populate("branch"); 
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (user.status !== "Active") return res.status(403).json({ message: "Account restricted." });

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.role?.name, res);

    res.status(200).json({
      token,
      user: formatUserResponse(user), // 🚀 ফ্রন্টএন্ডে অবজেক্ট পাঠাবে
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // 🚀 এখানেও .populate("branch") দেওয়া আছে
    const user = await User.findById(req.user._id)
      .populate("role")
      .populate("branch"); 

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(formatUserResponse(user)); // 🚀 ফ্রন্টএন্ডে অবজেক্ট পাঠাবে
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV !== "development", sameSite: "strict" });
  res.status(200).json({ message: "Logged out successfully" });
};







export const register = async (req, res) => {
  try {
    const { 
      username, email, password, full_name, 
      employee_id, phone, designation, department, branch, role 
    } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { employee_id }] 
    }).select("email username employee_id");

    if (existingUser) {
      if (existingUser.email === email) return res.status(400).json({ message: "Email already exists" });
      if (existingUser.username === username) return res.status(400).json({ message: "Username already exists" });
      if (existingUser.employee_id === employee_id) return res.status(400).json({ message: "Employee ID already exists" });
    }

    let roleId = role;
    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      const dbRole = await Role.findOne({ name: roleId || "instructor" });
      if (dbRole) roleId = dbRole._id;
    }

    const user = new User({
      email, username, password, full_name, employee_id,
      phone, designation: designation || "Staff", department: department || "General",
      branch, role: roleId, status: "Active"
    });

    await user.save();
    
    // Mongoose কে ফোর্স করা হচ্ছে ডাটা আনার জন্য
    const populatedUser = await User.findById(user._id)
      .populate("role")
      .populate("branch");

    res.status(201).json({
      message: "Account registered successfully.",
      user: formatUserResponse(populatedUser),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};