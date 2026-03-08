import express from "express";
import * as courseCtrl from "../controllers/course.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { courseCreateSchema, courseUpdateSchema } from "../validators/course.validator.js"; 

const router = express.Router();

router.use(verifyToken);


router.get("/all", requirePermission("view_courses"), courseCtrl.getAllCourses);
router.get("/active", requirePermission("view_courses"), courseCtrl.getActiveCourses);
router.get("/:id", requirePermission("view_courses"), courseCtrl.getCourseById);


router.post("/create", requirePermission("manage_courses"), validate(courseCreateSchema), courseCtrl.createCourse);
router.put("/update/:id", requirePermission("manage_courses"), validate(courseUpdateSchema), courseCtrl.updateCourse);
router.patch("/toggle-status/:id", requirePermission("manage_courses"), courseCtrl.toggleCourseStatus);
router.delete("/delete/:id", requirePermission("manage_courses"), courseCtrl.deleteCourse);

export default router;