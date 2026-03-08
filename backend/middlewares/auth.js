import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { ENV } from "../lib/env.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

const checkIsMaster = (role) => {
  if (!role) return false;
  const safeName = role.name?.toLowerCase().replace(/\s/g, ''); 
  return safeName === "superadmin" || safeName === "admin" || (Array.isArray(role.permissions) && role.permissions.includes("all_access"));
};


export const verifyToken = catchAsync(async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return next(new AppError("Unauthorized - No Token Provided", 401));

  const decoded = jwt.verify(token, ENV.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password").populate("role");

  if (!user) return next(new AppError("Account not found", 404));
  if (user.status !== "Active") return next(new AppError("Your account is deactivated", 403));

  req.user = user;
  req.isMaster = checkIsMaster(user.role);
  
  next();
});


export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (req.isMaster) return next();

    const permissions = req.user.role?.permissions || [];
    // console.log(permissions)
    if (permissions.includes(requiredPermission)) return next();

    return next(new AppError(`Access denied. Missing permission: ${requiredPermission}`, 403));
  };
};


export const injectBranchFilter = (req, res, next) => {
  req.branchFilter = { branch: req.user.branch };

  if (req.isMaster) {
    const requestedBranch = req.query.branch || req.body.branch;
    
    if (requestedBranch && requestedBranch !== "all") {
      req.branchFilter = { branch: requestedBranch }; 
    } else {
      req.branchFilter = {}; 
    }
  } else {
    const requestedBranch = req.params.branchId || req.query.branch || req.body.branch;
    
    if (requestedBranch && requestedBranch !== "all" && requestedBranch.toString() !== req.user.branch.toString()) {
      return next(new AppError("Branch Access Denied! You can only access your own campus data.", 403));
    }
  }

  next();
};