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
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

router.use(verifyToken);
router.use(injectBranchFilter);

router.get(
  "/batch/:batchId",
  requirePermission(PERMISSIONS.VIEW_CLASSES),
  classCtrl.getBatchClasses,
);

router.post(
  "/batch/:batchId",
  requirePermission(PERMISSIONS.MANAGE_CLASSES),
  validate(addClassSchema),
  classCtrl.addClassToSyllabus,
);
router.post(
  "/batch/:batchId/auto-schedule",
  requirePermission(PERMISSIONS.MANAGE_CLASSES),
  classCtrl.autoScheduleSyllabus,
);

router.put(
  "/:classId/schedule",
  requirePermission(PERMISSIONS.MANAGE_CLASSES),
  validate(scheduleClassSchema),
  classCtrl.scheduleClass,
);
router.put(
  "/:classId/attendance",
  requirePermission(PERMISSIONS.TAKE_ATTENDANCE),
  validate(updateAttendanceSchema),
  classCtrl.updateClassAttendance,
);
router.put(
  "/:classId",
  requirePermission(PERMISSIONS.MANAGE_CLASSES),
  validate(updateClassContentSchema),
  classCtrl.updateClassContent,
);

router.delete(
  "/:classId",
  requirePermission(PERMISSIONS.MANAGE_CLASSES),
  classCtrl.deleteClassContent,
);

export default router;
