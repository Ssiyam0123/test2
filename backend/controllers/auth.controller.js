import { generateToken } from "../lib/genToken.js";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    // req.body is already 100% validated by Joi middleware
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

    // 2. Create User
    const user = new User({
      email,
      username,
      password, 
      full_name,
      employee_id,
      phone,
      designation: designation || "Staff",
      department: department || "General",
      branch, 
      role: role || "instructor", // SECURITY FIX: Default to lowest privilege if not provided
      status: "Active"
    });

    await user.save();

    res.status(201).json({
      message: "Account registered successfully. Please log in.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    // req.body is already validated by Joi loginSchema
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ message: "Your account is restricted. Contact Admin." });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT and set HTTP-only cookie
    const token = generateToken(user._id, user.role, res);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // req.user is verified and populated by the protectRoute middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};