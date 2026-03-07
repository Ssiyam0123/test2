import express from "express";
import * as classCtrl from "../controllers/class.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addClassSchema, updateClassContentSchema, scheduleClassSchema, updateAttendanceSchema } from "../validators/class.validator.js"; // 🚀 Zod Schemas

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ ROUTES
// ==========================================
router.get("/batch/:batchId", requirePermission("view_classes"), injectBranchFilter, classCtrl.getBatchClasses);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post("/batch/:batchId", requirePermission("manage_classes"), injectBranchFilter, validate(addClassSchema), classCtrl.addClassToSyllabus);
router.post("/batch/:batchId/auto-schedule", requirePermission("manage_classes"), injectBranchFilter, classCtrl.autoScheduleSyllabus);

router.put("/:classId/schedule", requirePermission("manage_classes"), injectBranchFilter, validate(scheduleClassSchema), classCtrl.scheduleClass);
router.put("/:classId/attendance", requirePermission("take_attendance"), injectBranchFilter, validate(updateAttendanceSchema), classCtrl.updateClassAttendance);
router.put("/:classId", requirePermission("manage_classes"), injectBranchFilter, validate(updateClassContentSchema), classCtrl.updateClassContent);

router.delete("/:classId", requirePermission("manage_classes"), injectBranchFilter, classCtrl.deleteClassContent);

export default router;