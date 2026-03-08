import express from "express";
import * as classCtrl from "../controllers/class.controller.js";
import {
  verifyToken,
  requirePermission,
  injectBranchFilter,
} from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  addClassSchema,
  updateClassContentSchema,
  scheduleClassSchema,
  updateAttendanceSchema,
} from "../validators/class.validator.js";

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

router.get(
  "/batch/:batchId",
  requirePermission("view_classes"),
  classCtrl.getBatchClasses,
);

router.post(
  "/batch/:batchId",
  requirePermission("manage_classes"),
  validate(addClassSchema),
  classCtrl.addClassToSyllabus,
);
router.post(
  "/batch/:batchId/auto-schedule",
  requirePermission("manage_classes"),
  classCtrl.autoScheduleSyllabus,
);

router.put(
  "/:classId/schedule",
  requirePermission("manage_classes"),
  validate(scheduleClassSchema),
  classCtrl.scheduleClass,
);
router.put(
  "/:classId/attendance",
  requirePermission("take_attendance"),
  validate(updateAttendanceSchema),
  classCtrl.updateClassAttendance,
);
router.put(
  "/:classId",
  requirePermission("manage_classes"),
  validate(updateClassContentSchema),
  classCtrl.updateClassContent,
);

router.delete(
  "/:classId",
  requirePermission("manage_classes"),
  classCtrl.deleteClassContent,
);

export default router;
