import express from "express";
import * as classCtrl from "../controllers/class.controller.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addClassSchema, updateClassContentSchema, scheduleClassSchema, updateAttendanceSchema } from "../validators/class.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);
router.use(injectBranchFilter);

router.get("/batch/:batchId", requirePermission(PERMISSIONS.VIEW_BATCH_WORKSPACE), classCtrl.getBatchClasses);
router.post("/batch/:batchId", requirePermission(PERMISSIONS.CURRICULUM_MATRIX), validate(addClassSchema), classCtrl.addClassToSyllabus);
router.post("/batch/:batchId/auto-schedule", requirePermission(PERMISSIONS.VIEW_BATCH_CALENDAR), classCtrl.autoScheduleSyllabus);

router.put("/:classId/schedule", requirePermission(PERMISSIONS.VIEW_BATCH_CALENDAR), validate(scheduleClassSchema), classCtrl.scheduleClass);
router.put("/:classId/attendance", requirePermission(PERMISSIONS.TAKE_ATTENDANCE), validate(updateAttendanceSchema), classCtrl.updateClassAttendance);
router.put("/:classId", requirePermission(PERMISSIONS.CURRICULUM_MATRIX), validate(updateClassContentSchema), classCtrl.updateClassContent);

router.delete("/:classId", requirePermission(PERMISSIONS.CURRICULUM_MATRIX), classCtrl.deleteClassContent);

export default router;