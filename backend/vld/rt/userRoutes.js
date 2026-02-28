import express from "express";
import {
  addUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  removeUserImage,
  searchUser,
  updateUserRole
} from "../../controllers/user.controller.js";
import { upload } from "../../middlewares/multer.js";
import protectRoute from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/auth.js";

import { 
  validateUserFields, 
  checkUserDuplicates, 
  processUserPayload,
  validateRoleUpdate
} from "../../validators/user.validator.js";

const router = express.Router();

router.use(protectRoute);

// Admin & Registrar: View and Search users
router.get("/search", authorize("admin", "registrar"), searchUser);
router.get("/all", authorize("admin", "registrar"), getAllUsers);
router.get("/:id", authorize("admin", "registrar"), getUserById);

// Admin only: Full CRUD operations
router.post(
  "/create", 
  authorize("admin"), 
  upload.single("photo"),
  // validateUserFields, 
  checkUserDuplicates, 
  processUserPayload,
  addUser
);

router.put(
  "/:id", 
  authorize("admin"), 
  upload.single("photo"),
  validateUserFields, 
  checkUserDuplicates, 
  processUserPayload, 
  updateUser
);

// Unified exact route naming convention
router.delete("/:id/image", authorize("admin"), removeUserImage);
router.delete("/:id", authorize("admin"), deleteUser);
router.patch("/update-status/:id", authorize("admin"), updateUserStatus);

// Role updates
router.patch(
  "/:id/role", 
  authorize("admin"), 
  validateRoleUpdate, 
  updateUserRole
);

export default router;