import express from "express";
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from "../controllers/role.controller.js";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// All role management requires the "manage_roles" permission
router.post("/", requirePermission("manage_roles"), validate(createRoleSchema), createRole);
router.get("/", requirePermission("manage_roles"), getRoles);
router.get("/:id", requirePermission("manage_roles"), getRoleById);
router.put("/:id", requirePermission("manage_roles"), validate(updateRoleSchema), updateRole);
router.delete("/:id", requirePermission("manage_roles"), deleteRole);

export default router;