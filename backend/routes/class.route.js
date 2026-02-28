import express from "express";
import * as classCtrl from "../controllers/class.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

const router = express.Router();
router.use(protectRoute);

router.get("/batch/:batchId", classCtrl.getBatchClasses);
router.post("/batch/:batchId", authorize("superadmin", "admin", "registrar", "instructor"), classCtrl.addClassToSyllabus);
router.post("/batch/:batchId/auto-schedule", authorize("superadmin", "admin", "registrar"), classCtrl.autoScheduleSyllabus);

router.put("/:classId/schedule", authorize("superadmin", "admin", "registrar"), classCtrl.scheduleClass);
router.put("/:classId/attendance", authorize("superadmin", "admin", "registrar", "instructor"), classCtrl.updateClassAttendance);
router.delete("/:classId", authorize("superadmin", "admin", "registrar"), classCtrl.deleteClassContent);

export default router;