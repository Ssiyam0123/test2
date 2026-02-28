import express from "express";
import {
  addStudent, deleteStudent, getAllStudents, updateStudent, toggleStudentStatus, searchStudent,
  publicSearchStudent, getAdminStudentById, getPublicStudentById, removeStudentImage
} from "../controllers/student.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import { addComment, getStudentComments } from "../controllers/comment.controller.js";
import { validate } from "../middlewares/validate.js";
import { studentCreateSchema, studentUpdateSchema } from "../validators/student.validator.js";

const router = express.Router();

// PUBLIC
router.get("/public/search", publicSearchStudent);
router.get("/public/:id", getPublicStudentById);

// PROTECTED
router.get("/all", protectRoute, authorize("superadmin", "admin", "registrar", "instructor"), getAllStudents);
router.post("/:studentId/comments", protectRoute, authorize("superadmin", "admin", "instructor"), addComment);
router.get("/:studentId/comments", protectRoute, authorize("superadmin", "admin", "instructor"), getStudentComments);

// REGISTRAR & ADMIN CRUD
router.post("/create", protectRoute, authorize("superadmin", "admin", "registrar"), upload.single("photo"), validate(studentCreateSchema), addStudent);
router.put("/update/:id", protectRoute, authorize("superadmin", "admin", "registrar"), upload.single("photo"), validate(studentUpdateSchema), updateStudent);
router.patch("/toggle-status/:id", protectRoute, authorize("superadmin", "admin", "registrar"), toggleStudentStatus);
router.delete("/remove-image/:id", protectRoute, authorize("superadmin", "admin", "registrar"), removeStudentImage);
router.delete("/delete/:id", protectRoute, authorize("superadmin", "admin", "registrar"), deleteStudent);

router.get("/search", protectRoute, authorize("superadmin", "admin", "registrar"), searchStudent);
router.get("/admin/:id", protectRoute, authorize("superadmin", "admin", "registrar"), getAdminStudentById);

export default router;