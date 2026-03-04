import express from "express";
import * as ctrl from "../controllers/mastersyllabus.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; // তোর প্রজেক্টের গ্লোবাল ভ্যালিডেটর মিডলওয়্যার
import { 
  masterSyllabusCreateSchema, 
  masterSyllabusUpdateSchema 
} from "../validators/syllabus.validator.js"; // 🚀 Joi স্কিমা ইমপোর্ট

const router = express.Router();

// সব রুটের জন্যই টোকেন ভেরিফিকেশন লাগবে
router.use(verifyToken);

/**
 * @route   POST /api/syllabus
 * @desc    Create single or multiple (bulk) syllabus topics
 * @access  Private (manage_courses permission)
 */
router.post(
  "/", 
  requirePermission("manage_courses"), 
  validate(masterSyllabusCreateSchema), // 🚀 রিকোয়েস্ট বডি ভ্যালিডেশন
  ctrl.createMasterSyllabus
);

/**
 * @route   GET /api/syllabus/course/:courseId
 * @desc    Get all master syllabus topics for a specific course
 */
router.get(
  "/course/:courseId", 
  requirePermission("view_courses"), 
  ctrl.getCourseSyllabus
);

/**
 * @route   GET /api/syllabus/topic/:id
 * @desc    Get a single topic detail (for edit view)
 */
router.get(
  "/topic/:id", 
  requirePermission("view_courses"), 
  ctrl.getSyllabusTopic
);

/**
 * @route   PUT /api/syllabus/topic/:id
 * @desc    Update a specific topic
 */
router.put(
  "/topic/:id", 
  requirePermission("manage_courses"), 
  validate(masterSyllabusUpdateSchema), // 🚀 আপডেট ডাটা ভ্যালিডেশন
  ctrl.updateMasterSyllabus
);

/**
 * @route   DELETE /api/syllabus/topic/:id
 * @desc    Delete a topic from master syllabus
 */
router.delete(
  "/topic/:id", 
  requirePermission("manage_courses"), 
  ctrl.deleteMasterSyllabus
);

export default router;