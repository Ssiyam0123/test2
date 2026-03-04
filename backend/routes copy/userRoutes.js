import express from "express";
import {
  addUser, deleteUser, getAllUsers, getUserById, updateUser,
  updateUserStatus, removeUserImage, searchUser, updateUserRole
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";

// 🚀 FIXED: The imports now perfectly match your validator file!
import { userCreateSchema, updateUserSchema, roleUpdateSchema } from "../validators/user.validator.js";

// PBAC Auth Middlewares
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ OPERATIONS
// ==========================================
router.get("/search", requirePermission("view_employees"), branchGuard, searchUser);
router.get("/all", requirePermission("view_employees"), branchGuard, getAllUsers);
router.get("/:id", requirePermission("view_employees"), getUserById);

// ==========================================
// WRITE OPERATIONS
// ==========================================
router.post(
  "/create", 
  requirePermission("add_employee"), 
  upload.single("photo"), 
  validate(userCreateSchema), 
  addUser
);

router.put(
  "/:id", 
  requirePermission("edit_employee"), 
  upload.single("photo"), 
  validate(updateUserSchema), // 🚀 FIXED: Uses the exact name from your validator
  updateUser
);

// ==========================================
// UTILITY & STATUS OPERATIONS
// ==========================================
router.delete("/:id/image", requirePermission("edit_employee"), removeUserImage);
router.delete("/:id", requirePermission("delete_employee"), deleteUser);
router.patch("/update-status/:id", requirePermission("edit_employee"), updateUserStatus);

// Explicitly separate Role Updates so regular branch admins can't exploit it
router.patch(
  "/:id/role", 
  requirePermission("manage_roles"), 
  validate(roleUpdateSchema), 
  updateUserRole
);

export default router;