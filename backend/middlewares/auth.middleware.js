import jwt from "jsonwebtoken";
import User from "../models/user.js"; 
import { ENV } from "../lib/env.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // FIXED: Expand the allowed roles to include the new hierarchy
    const allowedRoles = ["superadmin", "admin", "instructor", "registrar", "staff"]; 
    
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.role !== decoded.role) {
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied: Permissions revoked" });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid Session" });
  }
};

export default protectRoute;