import express from "express";
import * as courseCtrl from "../controllers/course.controller.js";
import { verifyToken, requirePermission } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { courseCreateSchema, courseUpdateSchema } from "../validators/course.validator.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();
router.use(verifyToken);

router.get("/all", requirePermission(PERMISSIONS.VIEW_COURSES), courseCtrl.getAllCourses);
router.get("/active", requirePermission(PERMISSIONS.VIEW_COURSES), courseCtrl.getActiveCourses);
router.get("/:id", requirePermission(PERMISSIONS.VIEW_COURSES), courseCtrl.getCourseById);

router.post("/create", requirePermission(PERMISSIONS.COURSE_EDIT), validate(courseCreateSchema), courseCtrl.createCourse);
router.put("/update/:id", requirePermission(PERMISSIONS.COURSE_EDIT), validate(courseUpdateSchema), courseCtrl.updateCourse);
router.patch("/toggle-status/:id", requirePermission(PERMISSIONS.COURSE_ACTIVE), courseCtrl.toggleCourseStatus);
router.delete("/delete/:id", requirePermission(PERMISSIONS.COURSE_DELETE), courseCtrl.deleteCourse);

export default router;