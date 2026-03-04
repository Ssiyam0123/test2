import express from "express";
import * as classCtrl from "../controllers/class.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// ==========================================
// READ ROUTES
// ==========================================
router.get("/batch/:batchId", requirePermission("view_classes"), classCtrl.getBatchClasses);

// ==========================================
// WRITE ROUTES
// ==========================================
router.post("/batch/:batchId", requirePermission("manage_classes"), classCtrl.addClassToSyllabus);
router.post("/batch/:batchId/auto-schedule", requirePermission("manage_classes"), classCtrl.autoScheduleSyllabus);

router.put("/:classId/schedule", requirePermission("manage_classes"), classCtrl.scheduleClass);
router.put("/:classId/attendance", requirePermission("take_attendance"), classCtrl.updateClassAttendance);

// 🚀 Missing route added for updating class details
router.put("/:classId", requirePermission("manage_classes"), classCtrl.updateClassContent);

router.delete("/:classId", requirePermission("manage_classes"), classCtrl.deleteClassContent);

export default router;