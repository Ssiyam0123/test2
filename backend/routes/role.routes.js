import express from "express";
import { createRole, getRoles, getRoleById, updateRole, deleteRole } from "../controllers/role.controller.js";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js"; // You'll create requirePermission next!

const router = express.Router();

// Only Superadmins (or people with manage_roles permission) can hit these routes
router.use(verifyToken);

router.post("/", validate(createRoleSchema), createRole);
router.get("/", getRoles);
router.get("/:id", getRoleById);
router.put("/:id", validate(updateRoleSchema), updateRole);
router.delete("/:id", deleteRole);

export default router;