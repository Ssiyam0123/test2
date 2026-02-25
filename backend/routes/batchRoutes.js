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

const router = express.Router();

// Get operations
router.get("/", getAllBatches);
router.get("/:batchId/classes", getBatchClasses);

// Core CRUD with Middlewares
router.post("/", validateBatchRequiredFields, checkBatchDuplicates, processBatchPayload, createBatch);
router.put("/:id", checkBatchDuplicates, processBatchPayload, updateBatch);
router.delete("/:id", deleteBatch);
router.get("/:id", getBatchById);
// Syllabus & Class Management
router.post("/:batchId/syllabus", addClassToSyllabus);
router.post("/:batchId/auto-schedule", autoScheduleSyllabus);

// THE FIX: Differentiated the PUT routes!
router.put("/classes/:classContentId/schedule", scheduleClass); 
router.put("/classes/:classId", updateClassContent);

router.delete("/classes/:classId", deleteClassContent);
router.put("/classes/:classId/attendance", updateClassAttendance);

export default router;