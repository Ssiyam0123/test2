import express from "express";
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from "../controllers/role.controller.js";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);

router.get("/", requirePermission(PERMISSIONS.MANAGE_ROLES), getRoles);
router.get("/:id", requirePermission(PERMISSIONS.MANAGE_ROLES), getRoleById);
router.post("/", requirePermission(PERMISSIONS.MANAGE_ROLES), validate(createRoleSchema), createRole);
router.put("/:id", requirePermission(PERMISSIONS.MANAGE_ROLES), validate(updateRoleSchema), updateRole);
router.delete("/:id", requirePermission(PERMISSIONS.MANAGE_ROLES), deleteRole);

export default router;