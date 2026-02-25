import express from "express";
import {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  toggleBranchStatus,
  deleteBranch
} from "../controllers/branch.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

// Import the validators
import {
  validateBranchFields,
  checkBranchDuplicates,
  processBranchPayload
} from "../validators/branch.validator.js";

const router = express.Router();

// All branch routes require an active session
router.use(protectRoute);

// READ: Available to Admin, Registrar, and potentially Instructors (for UI dropdowns)
router.get("/all", authorize("admin", "registrar", "instructor"), getAllBranches);
router.get("/:id", authorize("admin", "registrar"), getBranchById);

// WRITE: Strictly isolated to Super Admin (Secured with Validation Pipeline)
router.post(
  "/create", 
  authorize("admin"), 
  validateBranchFields, 
  checkBranchDuplicates, 
  processBranchPayload, 
  createBranch
);

router.put(
  "/:id", 
  authorize("admin"), 
  validateBranchFields, 
  checkBranchDuplicates, 
  processBranchPayload, 
  updateBranch
);

// DANGER: Admin only
router.patch("/:id/toggle", authorize("admin"), toggleBranchStatus);
router.delete("/:id", authorize("admin"), deleteBranch);

export default router;