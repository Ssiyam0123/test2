import express from "express";
import * as ctrl from "../controllers/branch.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { branchCreateSchema, branchUpdateSchema } from "../validators/branch.validator.js";

const router = express.Router();

router.use(verifyToken);

router.get("/all", requirePermission("view_branches"), ctrl.getAllBranches);
router.get("/:id", requirePermission("view_branches"), ctrl.getBranchById);

router.post("/create", requirePermission("manage_branches"), validate(branchCreateSchema), ctrl.createBranch);
router.put("/:id", requirePermission("manage_branches"), validate(branchUpdateSchema), ctrl.updateBranch);
router.patch("/:id/toggle", requirePermission("manage_branches"), ctrl.toggleBranchStatus);
router.delete("/:id", requirePermission("manage_branches"), ctrl.deleteBranch);

export default router;