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


const router = express.Router();

// Course routes
router.get("/all", protectRoute, getAllCourses);
router.get("/active", getActiveCourses);
router.get("/:id", getCourseById);
router.post("/create", protectRoute,  createCourse);
router.put("/update/:id", protectRoute, updateCourse);
router.delete("/delete/:id", protectRoute, deleteCourse);
router.patch("/toggle-status/:id", protectRoute, toggleCourseStatus);

export default router;