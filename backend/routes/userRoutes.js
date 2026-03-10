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
  // requirePermission(PERMISSIONS.VIEW_EMPLOYEES),
  userCtrl.getUserById,
);

router.post(
  "/create",
  requirePermission(PERMISSIONS.EMPLOYEE_EDIT),
  upload.single("photo"),
  validate(userCreateSchema),
  userCtrl.addUser,
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.EMPLOYEE_EDIT),
  upload.single("photo"),
  validate(updateUserSchema),
  userCtrl.updateUser,
);
router.patch(
  "/update-status/:id",
  requirePermission(PERMISSIONS.EMPLOYEE_ACTIVE_STATUS),
  userCtrl.updateUserStatus,
);
router.patch(
  "/:id/role",
  requirePermission(PERMISSIONS.EMPLOYEE_ROLE_CONTROL),
  validate(roleUpdateSchema),
  userCtrl.updateUserRole,
);

router.delete(
  "/:id/image",
  requirePermission(PERMISSIONS.EMPLOYEE_EDIT),
  userCtrl.removeUserImage,
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.EMPLOYEE_DELETE),
  userCtrl.deleteUser,
);

router.get("/profile/me", userCtrl.getMyProfile);

router.put(
  "/profile/update",
  requirePermission(PERMISSIONS.UPDATE_MY_PROFILE),
  upload.single("photo"),
  validate(updateUserSchema),
  userCtrl.updateMyProfile,
);

export default router;
