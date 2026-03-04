import express from "express";
import {
  getAllCourses, getActiveCourses, getCourseById, createCourse,
  updateCourse, deleteCourse, toggleCourseStatus,
} from "../controllers/course.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validateCourseFields, checkCourseDuplicates, processCoursePayload } from "../validators/course.validator.js";

const router = express.Router();

router.use(verifyToken);

// Read
router.get("/all", requirePermission("view_courses"), getAllCourses);
router.get("/active", requirePermission("view_courses"), getActiveCourses);
router.get("/:id", requirePermission("view_courses"), getCourseById);

// Write (Courses are usually global, managed by those with "manage_courses")
router.post("/create", requirePermission("manage_courses"), validateCourseFields, checkCourseDuplicates, processCoursePayload, createCourse);
router.put("/update/:id", requirePermission("manage_courses"), validateCourseFields, checkCourseDuplicates, processCoursePayload, updateCourse);
router.patch("/toggle-status/:id", requirePermission("manage_courses"), toggleCourseStatus);
router.delete("/delete/:id", requirePermission("manage_courses"), deleteCourse);

export default router;