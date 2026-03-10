import express from "express";
import * as userCtrl from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import {
  userCreateSchema,
  updateUserSchema,
  roleUpdateSchema,
} from "../validators/user.validator.js";
import {
  verifyToken,
  requirePermission,
  injectBranchFilter,
} from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(verifyToken);

router.get(
  "/all",
  requirePermission(PERMISSIONS.VIEW_EMPLOYEES),
  injectBranchFilter,
  userCtrl.getAllUsers,
);
router.get(
  "/search",
  requirePermission(PERMISSIONS.VIEW_EMPLOYEES),
  injectBranchFilter,
  userCtrl.searchUser,
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.VIEW_EMPLOYEES),
  userCtrl.getUserById,
);

router.post(
  "/create",
  requirePermission(PERMISSIONS.ADD_EMPLOYEE),
  upload.single("photo"),
  validate(userCreateSchema),
  userCtrl.addUser,
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE),
  upload.single("photo"),
  validate(updateUserSchema),
  userCtrl.updateUser,
);
router.patch(
  "/update-status/:id",
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE),
  userCtrl.updateUserStatus,
);
router.patch(
  "/:id/role",
  requirePermission(PERMISSIONS.MANAGE_ROLES),
  validate(roleUpdateSchema),
  userCtrl.updateUserRole,
);

router.delete(
  "/:id/image",
  requirePermission(PERMISSIONS.EDIT_EMPLOYEE),
  userCtrl.removeUserImage,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.DELETE_EMPLOYEE),
  userCtrl.deleteUser,
);

export default router;
