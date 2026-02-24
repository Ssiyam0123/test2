import User from "../models/user.js";
import { deleteLocalFile } from "../middlewares/multer.js";

// Helper to clean up uploaded files if a request fails
const cleanupFailedUpload = (file) => {
  if (file) deleteLocalFile(`/uploads/employees/${file.filename}`);
};

// 1. Check Required Fields Middleware
export const validateUserRequiredFields = (req, res, next) => {
  const { username, email, full_name } = req.body;
  
  if (!username || !email || !full_name) {
    cleanupFailedUpload(req.file);
    return res.status(400).json({ message: "Username, Email, and Full Name are strictly required." });
  }
  next();
};

// 2. Check Duplicates Middleware (Email, Username, Employee ID)
export const checkUserDuplicates = async (req, res, next) => {
  try {
    const { employee_id, email, username } = req.body;
    const excludeDbId = req.params.id || null;

    const orConditions = [];
    if (employee_id && employee_id.trim() !== "") orConditions.push({ employee_id: employee_id.trim() });
    if (email) orConditions.push({ email: email.trim().toLowerCase() });
    if (username) orConditions.push({ username: username.trim() });

    if (orConditions.length === 0) return next();

    const query = { $or: orConditions };
    if (excludeDbId) query._id = { $ne: excludeDbId };

    const existingUser = await User.findOne(query).select('employee_id email username');

    if (existingUser) {
      cleanupFailedUpload(req.file);
      if (employee_id && existingUser.employee_id === employee_id.trim()) {
        return res.status(400).json({ message: `Employee ID "${employee_id}" already exists.` });
      }
      if (existingUser.email === email.trim().toLowerCase()) {
        return res.status(400).json({ message: `Email "${email}" already exists.` });
      }
      if (existingUser.username === username.trim()) {
        return res.status(400).json({ message: `Username "${username}" is already taken.` });
      }
    }
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(500).json({ message: "Error validating user duplicates" });
  }
};

// 3. Process & Sanitize Payload Middleware
export const processUserPayload = (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Trim strings and format emails
    const stringFields = ['username', 'full_name', 'employee_id', 'phone', 'designation', 'department', 'role', 'status'];
    stringFields.forEach(field => {
      if (typeof payload[field] === 'string') payload[field] = payload[field].trim();
    });
    if (payload.email) payload.email = payload.email.trim().toLowerCase();

    // Handle Password Logic
    if (req.method === 'POST') {
      // Default password for new users if not provided
      payload.password = (payload.password && payload.password.trim() !== "") ? payload.password : "123456";
    } else if (req.method === 'PUT') {
      // If updating and password is blank, remove it so we don't overwrite the existing one
      if (!payload.password || payload.password.trim() === "") {
        delete payload.password;
      }
    }

    // Structure Social Links into nested object
    payload.social_links = {
      facebook: payload.facebook?.trim() || "",
      linkedin: payload.linkedin?.trim() || "",
      twitter: payload.twitter?.trim() || "",
      instagram: payload.instagram?.trim() || ""
    };
    
    // Clean up flat keys since they are now nested
    delete payload.facebook;
    delete payload.linkedin;
    delete payload.twitter;
    delete payload.instagram;

    // Inject Photo URL
    if (req.file) {
      payload.photo_url = `/uploads/employees/${req.file.filename}`;
    }

    // Remove undefined fields to prevent accidental overwrites
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    req.body = payload;
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(400).json({ message: error.message });
  }
};