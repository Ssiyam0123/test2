import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";

// 🚀 FIXED: Helper to safely check Master Status (Case & Space Insensitive)
const checkIsMaster = (role) => {
  if (!role) return false;
  const safeName = role.name?.toLowerCase().replace(/\s/g, ''); // Turns "Super Admin" into "superadmin"
  return safeName === "superadmin" || (Array.isArray(role.permissions) && role.permissions.includes("all_access"));
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // Populate role so subsequent middlewares have access to the permissions array
    const user = await User.findById(decoded.userId).select("-password").populate("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const role = req.user?.role;
      if (!role) {
        return res.status(403).json({ message: "Access denied. No role assigned." });
      }

      // 🚀 FIXED: Use the safe Master Check
      if (checkIsMaster(role)) {
        return next();
      }

      // Exact Permission Check
      if (role.permissions?.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({ message: `Access denied. Missing permission: ${requiredPermission}` });
    } catch (error) {
      console.error("Require Permission Error:", error);
      res.status(500).json({ message: "Permission validation error" });
    }
  };
};

export const branchGuard = (req, res, next) => {
  try {
    const role = req.user?.role;
    
    // Safety check
    if (!role) {
       return res.status(403).json({ message: "BranchGuard Error: No role found on user." });
    }

    // 🚀 FIXED: Use the safe Master Check
    if (!checkIsMaster(role)) {
      if (!req.user.branch) {
         return res.status(403).json({ 
           success: false, 
           message: "BranchGuard Error: User is not a master admin but has no assigned branch." 
         });
      }
      req.branchFilter = { branch: req.user.branch };
    } else {
      // Master admins have no forced restrictions
      req.branchFilter = {};
    }
    
    next();
  } catch (error) {
    console.error("🔥 Branch Guard Fatal Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Fatal Error in branchGuard Middleware",
      exact_error: error.message 
    });
  }
};