import express from "express";
import * as ctrl from "../controllers/mastersyllabus.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";

const router = express.Router();

router.use(verifyToken);

// Read: গ্লোবাল লাইব্রেরি থেকে ডেটা আনা
router.get("/", requirePermission("view_courses"), ctrl.getAllMasterTopics);
router.get("/topic/:id", requirePermission("view_courses"), ctrl.getSyllabusTopicById);

// Write: অ্যাডমিনরা ম্যানেজ করবে
router.post("/", requirePermission("manage_courses"), ctrl.createMasterSyllabus);
router.put("/topic/:id", requirePermission("manage_courses"), ctrl.updateMasterSyllabus);
router.delete("/topic/:id", requirePermission("manage_courses"), ctrl.deleteMasterSyllabus);

export default router;