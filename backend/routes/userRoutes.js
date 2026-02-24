import express from "express";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js"; 
import { upload } from "../middlewares/multer.js";
import {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  getUserById,
  updateUserStatus,
  removeUserImage,
  searchUser,
  toggleAdminRole
} from "../controllers/user.controller.js";

const router = express.Router();
import { 
  validateUserRequiredFields, 
  checkUserDuplicates, 
  processUserPayload 
} from "../validators/user.validator.js";
// ==========================================
// 1. STANDARD USER / EMPLOYEE MANAGEMENT
// ==========================================

// Get all users
router.get("/all", protectRoute, authorize("admin", "registrar", "instructor"), getAllUsers);

router.post(
  "/create",
  protectRoute,
  authorize("admin"), 
  upload.single("photo"), // Make sure multer path handles employees correctly
  validateUserRequiredFields,
  checkUserDuplicates,
  processUserPayload,
  addUser
);

// Update User
router.put(
  "/update/:id",
  protectRoute,
  authorize("admin"),
  upload.single("photo"),
  checkUserDuplicates, // Ignored self duplicate check via excludeDbId
  processUserPayload,
  updateUser
);

// Update user status (Active / On Leave / Resigned)
router.patch("/update-status/:id", protectRoute, authorize("admin"), updateUserStatus);

// Delete a user permanently
router.delete("/delete/:id", protectRoute, authorize("admin"), deleteUser);

// Remove only the user's photo
router.delete("/remove-image/:id", protectRoute, authorize("admin"), removeUserImage);

// Search users (Quick search by name, id, email)
router.get("/search", protectRoute, authorize("admin"), searchUser);

// ==========================================
// 2. ROLE MANAGEMENT
// ==========================================

// Toggle admin role (e.g., promote staff to admin, or demote admin to staff)
router.patch("/toggle-role/:id", protectRoute, authorize("admin"), toggleAdminRole);

// ==========================================
// 3. GET SINGLE USER (Keep this at the bottom)
// ==========================================

// Get a single user by ID 
router.get("/:id",   getUserById);

export default router;