import User from "../models/user.js";
import { deleteLocalFile } from "../middlewares/multer.js";

const cleanupFailedUpload = (file) => {
  if (file) deleteLocalFile(`/uploads/employees/${file.filename}`);
};

// 1. Check Required Fields & Formats
export const validateUserFields = (req, res, next) => {
  const { full_name, email, phone, employee_id, username, password, branch } =
    req.body;
  const isPost = req.method === "POST"; // True for creation, False for updates

  const missing = [];
  // if (!full_name) missing.push("full_name");
  if (!email) missing.push("email");
  if (!phone) missing.push("phone");
  if (!employee_id) missing.push("employee_id");
  if (!username) missing.push("username");
  if (isPost && !branch) missing.push("branch");
  if (isPost && !password) missing.push("password"); // Password only strictly required on creation

  if (missing.length > 0) {
    cleanupFailedUpload(req.file);
    return res
      .status(400)
      .json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    cleanupFailedUpload(req.file);
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Password length validation (only if provided)
  if (password && password.length < 6) {
    cleanupFailedUpload(req.file);
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long." });
  }

  next();
};

// 2. Database Validation for Duplicates
export const checkUserDuplicates = async (req, res, next) => {
  try {
    const { email, username, employee_id } = req.body;
    const excludeDbId = req.params.id || null;

    const query = { $or: [] };
    if (email) query.$or.push({ email: email.toLowerCase().trim() });
    if (username) query.$or.push({ username: username.toLowerCase().trim() });
    if (employee_id) query.$or.push({ employee_id: employee_id.trim() });
    if (excludeDbId) query._id = { $ne: excludeDbId }; // Ignore current user if updating

    if (query.$or.length > 0) {
      const existingUser = await User.findOne(query).select(
        "email username employee_id",
      );

      if (existingUser) {
        cleanupFailedUpload(req.file);
        if (email && existingUser.email === email.toLowerCase().trim()) {
          return res.status(400).json({ message: "Email already exists." });
        }
        if (
          username &&
          existingUser.username === username.toLowerCase().trim()
        ) {
          return res.status(400).json({ message: "Username already exists." });
        }
        if (employee_id && existingUser.employee_id === employee_id.trim()) {
          return res
            .status(400)
            .json({ message: "Employee ID already exists." });
        }
      }
    }

    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(500).json({ message: "Error validating user uniqueness." });
  }
};

// 3. Sanitize Payload & Inject File Path
export const processUserPayload = (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Clean strings
    const stringFields = [
      "full_name",
      "phone",
      "employee_id",
      "username",
      "designation",
      "department",
    ];
    stringFields.forEach((field) => {
      if (typeof payload[field] === "string")
        payload[field] = payload[field].trim();
    });

    if (payload.email) payload.email = payload.email.toLowerCase().trim();
    if (payload.branch) payload.branch = payload.branch.trim();
    // Set default role if not provided
    if (!payload.role) payload.role = "staff";

    // ✅ NEW: Format the social_links object for the database
    payload.social_links = {
      facebook: payload.facebook || "",
      linkedin: payload.linkedin || "",
      twitter: payload.twitter || "",
      instagram: payload.instagram || "",
      others: payload.others || "",
    };

    // Clean up the flat keys so they don't clutter the main document
    delete payload.facebook;
    delete payload.linkedin;
    delete payload.twitter;
    delete payload.instagram;
    delete payload.others;

    // Inject photo path if uploaded
    if (req.file) {
      payload.photo_url = `/uploads/employees/${req.file.filename}`;
    }

    // Clean undefined
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );

    req.body = payload;
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(400).json({ message: error.message });
  }
};

// 4. Role Update Validator
export const validateRoleUpdate = (req, res, next) => {
  const { role } = req.body;
  const validRoles = ["admin", "instructor", "register", "staff"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role selected." });
  }

  // Prevent self-modification
  if (req.user && req.user._id.toString() === req.params.id) {
    return res
      .status(400)
      .json({ message: "You cannot change your own role." });
  }

  next();
};
