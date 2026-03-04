import express from "express";
import {
  addUser, deleteUser, getAllUsers, getUserById, updateUser,
  updateUserStatus, removeUserImage, searchUser, updateUserRole
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { userCreateSchema, updateUserSchema, roleUpdateSchema } from "../validators/user.validator.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; // 🚀 Updated Middleware

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ OPERATIONS
// ==========================================
// 🚀 injectBranchFilter applied for data isolation
router.get("/search", requirePermission("view_employees"), injectBranchFilter, searchUser);
router.get("/all", requirePermission("view_employees"), injectBranchFilter, getAllUsers);
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
  validate(updateUserSchema), 
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