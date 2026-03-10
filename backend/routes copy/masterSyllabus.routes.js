import express from "express";
import * as ctrl from "../controllers/mastersyllabus.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);

router.get(
  "/",
  requirePermission(PERMISSIONS.VIEW_SYLLABUS),
  ctrl.getAllMasterTopics,
);
router.get(
  "/topic/:id",
  requirePermission(PERMISSIONS.VIEW_SYLLABUS),
  ctrl.getSyllabusTopicById,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.MANAGE_SYLLABUS),
  ctrl.createMasterSyllabus,
);
router.put(
  "/topic/:id",
  requirePermission(PERMISSIONS.MANAGE_SYLLABUS),
  ctrl.updateMasterSyllabus,
);
router.delete(
  "/topic/:id",
  requirePermission(PERMISSIONS.MANAGE_SYLLABUS),
  ctrl.deleteMasterSyllabus,
);

export default router;
