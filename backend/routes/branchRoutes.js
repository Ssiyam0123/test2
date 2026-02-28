import express from "express";
import * as ctrl from "../controllers/branch.controller.js";
import { getBranchStats } from "../controllers/dashboard.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { branchCreateSchema, branchUpdateSchema } from "../validators/branch.validator.js";

const router = express.Router();

router.use(protectRoute);

// READ: Everyone needs to see branches to use the UI dropdowns
router.get("/all", authorize("superadmin", "admin", "registrar", "instructor"), ctrl.getAllBranches);
router.get("/:id", authorize("superadmin", "admin", "registrar"), ctrl.getBranchById);
router.get("/stats/:branchId", authorize("superadmin", "admin", "registrar"), getBranchStats);

// WRITE: STRICTLY SUPERADMIN ONLY. Branch Admins cannot create or delete campuses.
router.post("/create", authorize("superadmin"), validate(branchCreateSchema), ctrl.createBranch);
router.put("/:id", authorize("superadmin"), validate(branchUpdateSchema), ctrl.updateBranch);
router.patch("/:id/toggle", authorize("superadmin"), ctrl.toggleBranchStatus);
router.delete("/:id", authorize("superadmin"), ctrl.deleteBranch);

export default router;