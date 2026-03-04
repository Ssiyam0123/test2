import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";

const checkIsMaster = (role) => {
  if (!role) return false;
  const safeName = role.name?.toLowerCase().replace(/\s/g, '');
  return safeName === "superadmin" || (Array.isArray(role.permissions) && role.permissions.includes("all_access"));
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

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
    const userRole = (typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || "").toLowerCase();
    const permissions = req.user.permissions || req.user.role?.permissions || [];

    if (userRole === "superadmin" || userRole === "admin" || permissions.includes("all_access")) {
      return next();
    }

    if (permissions.includes(requiredPermission)) {
      return next();
    }

    return res.status(403).json({ success: false, message: `Access denied. Missing permission: ${requiredPermission}` });
  };
};

export const branchGuard = (req, res, next) => {
  const userRole = (typeof req.user.role === 'string' ? req.user.role : req.user.role?.name || "").toLowerCase();
  const permissions = req.user.permissions || req.user.role?.permissions || [];

  // 🚀 SUPERADMIN & ADMIN BYPASS: এদের ব্রাঞ্চ লক থাকবে না
  if (userRole === "superadmin" || userRole === "admin" || permissions.includes("all_access")) {
    return next();
  }

  const requestedBranch = req.params.branchId || req.body.branch || req.query.branch;
  const userBranch = req.user.branch?.toString();

  if (requestedBranch && requestedBranch !== userBranch) {
    return res.status(403).json({ success: false, message: "Branch Access Denied!" });
  }

  next();
};