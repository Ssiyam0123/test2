import jwt from "jsonwebtoken";
import User from "../models/user.js"; 
import { ENV } from "../lib/env.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;

    // Support both Cookies and Bearer headers
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // 1. Decode the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // 2. FAIL-FAST: Check role from the token BEFORE hitting the database
    const allowedRoles = ["admin", "instructor", "registrar"]; 
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient permissions" });
    }

    // 3. Fetch user data for downstream controllers
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    // 4. Security Check: Ensure DB role matches token role (in case role was revoked mid-session)
    if (user.role !== decoded.role) {
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied: Permissions revoked" });
      }
    }

    // Attach the User object to the request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid Session" });
  }
};

export default protectRoute;