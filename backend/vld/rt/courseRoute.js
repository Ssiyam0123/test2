import express from "express";
import {
  getAllCourses,
  getActiveCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} from "../controllers/course.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";

// Import new middlewares
import { 
  validateCourseFields, 
  checkCourseDuplicates, 
  processCoursePayload 
} from "../validators/course.validator.js";

const router = express.Router();

// Apply authentication to ALL course routes
router.use(protectRoute);

// Fetch Operations (Viewable by Admins, Registrars, and Instructors)
router.get("/all", authorize("admin", "registrar", "instructor"), getAllCourses);
router.get("/active", authorize("admin", "registrar", "instructor"), getActiveCourses);
router.get("/:id", authorize("admin", "registrar", "instructor"), getCourseById);

// Core CRUD Operations (Restricted to Admin & Registrar)
router.post(
  "/create", 
  authorize("admin", "registrar"),
  validateCourseFields,
  checkCourseDuplicates,
  processCoursePayload,
  createCourse
);

router.put(
  "/update/:id", 
  authorize("admin", "registrar"),
  validateCourseFields,
  checkCourseDuplicates,
  processCoursePayload,
  updateCourse
);

// Toggle & Delete (Restricted to Admin & Registrar)
router.patch("/toggle-status/:id", authorize("admin", "registrar"), toggleCourseStatus);
router.delete("/delete/:id", authorize("admin", "registrar"), deleteCourse);

export default router;