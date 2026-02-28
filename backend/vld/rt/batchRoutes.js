import express from "express";
import { 
  createBatch, getAllBatches, getBatchClasses, addClassToSyllabus, 
  scheduleClass, autoScheduleSyllabus, deleteBatch, updateBatch,
  deleteClassContent, updateClassContent,
  updateClassAttendance,
  getBatchById
} from "../controllers/batch.controller.js";

import { 
  validateBatchRequiredFields, 
  checkBatchDuplicates, 
  processBatchPayload 
} from "../validators/batch.validator.js";

// IMPORT AUTH MIDDLEWARES
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();

// ALL batch routes require the user to be logged in
router.use(protectRoute);

// Get operations
router.get("/", getAllBatches);
router.get("/:id", getBatchById);
router.get("/:batchId/classes", getBatchClasses);

// Core CRUD
router.post(
  "/", 
  authorize("admin", "registrar"), // Only Admins & Registrars can create batches
  validateBatchRequiredFields, 
  checkBatchDuplicates, 
  processBatchPayload, 
  createBatch
);

router.put(
  "/:id", 
  authorize("admin", "registrar"), 
  checkBatchDuplicates, 
  processBatchPayload, 
  updateBatch
);

router.delete("/:id", authorize("admin"), deleteBatch); // Only Admin can delete

// Syllabus & Class Management
router.post("/:batchId/syllabus", authorize("admin", "registrar", "instructor"), addClassToSyllabus);
router.post("/:batchId/auto-schedule", authorize("admin", "registrar"), autoScheduleSyllabus);

router.put("/classes/:classContentId/schedule", authorize("admin", "registrar"), scheduleClass); 
router.put("/classes/:classId", authorize("admin", "registrar", "instructor"), updateClassContent);
router.delete("/classes/:classId", authorize("admin", "registrar"), deleteClassContent);
router.put("/classes/:classId/attendance", authorize("admin", "registrar", "instructor"), updateClassAttendance);

export default router;