import express from "express";
import {
  getAllCourses, getActiveCourses, getCourseById, createCourse,
  updateCourse, deleteCourse, toggleCourseStatus,
} from "../controllers/course.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { validateCourseFields, checkCourseDuplicates, processCoursePayload } from "../validators/course.validator.js";

const router = express.Router();

router.use(protectRoute);

router.get("/all", authorize("superadmin", "admin", "registrar", "instructor"), getAllCourses);
router.get("/active", authorize("superadmin", "admin", "registrar", "instructor"), getActiveCourses);
router.get("/:id", authorize("superadmin", "admin", "registrar", "instructor"), getCourseById);

// Core CRUD Operations (Strictly Superadmin for global courses)
router.post("/create", authorize("superadmin"), validateCourseFields, checkCourseDuplicates, processCoursePayload, createCourse);
router.put("/update/:id", authorize("superadmin"), validateCourseFields, checkCourseDuplicates, processCoursePayload, updateCourse);
router.patch("/toggle-status/:id", authorize("superadmin"), toggleCourseStatus);
router.delete("/delete/:id", authorize("superadmin"), deleteCourse);

export default router;