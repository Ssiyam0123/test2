import express from "express";
import * as userCtrl from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { userCreateSchema, updateUserSchema, roleUpdateSchema } from "../validators/user.validator.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

router.get("/all", requirePermission("view_employees"), injectBranchFilter, userCtrl.getAllUsers);
router.get("/search", requirePermission("view_employees"), injectBranchFilter, userCtrl.searchUser);
router.get("/:id", requirePermission("view_employees"), userCtrl.getUserById);

router.post("/create", requirePermission("add_employee"), upload.single("photo"), validate(userCreateSchema), userCtrl.addUser);
router.put("/:id", requirePermission("edit_employee"), upload.single("photo"), validate(updateUserSchema), userCtrl.updateUser);
router.patch("/update-status/:id", requirePermission("edit_employee"), userCtrl.updateUserStatus);
router.patch("/:id/role", requirePermission("manage_roles"), validate(roleUpdateSchema), userCtrl.updateUserRole);

router.delete("/:id/image", requirePermission("edit_employee"), userCtrl.removeUserImage);
router.delete("/:id", requirePermission("delete_employee"), userCtrl.deleteUser);

export default router;