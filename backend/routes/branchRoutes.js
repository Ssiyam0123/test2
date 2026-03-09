import express from "express";
import * as ctrl from "../controllers/branch.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { branchCreateSchema, branchUpdateSchema } from "../validators/branch.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(verifyToken);

router.get("/all", requirePermission(PERMISSIONS.VIEW_BRANCHES), ctrl.getAllBranches);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_BRANCHES), ctrl.getBranchById);

router.post("/create", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validate(branchCreateSchema), ctrl.createBranch);
router.put("/:id", requirePermission(PERMISSIONS.MANAGE_BRANCHES), validate(branchUpdateSchema), ctrl.updateBranch);
router.patch("/:id/toggle", requirePermission(PERMISSIONS.MANAGE_BRANCHES), ctrl.toggleBranchStatus);
router.delete("/:id", requirePermission(PERMISSIONS.MANAGE_BRANCHES), ctrl.deleteBranch);

export default router;