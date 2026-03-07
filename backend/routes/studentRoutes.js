import express from "express";
import { 
  addStudent, getAllStudents, deleteStudent, getAdminStudentById, 
  updateStudent, toggleStudentStatus, removeStudentImage,
  searchStudent, publicSearchStudent, getPublicStudentById
} from "../controllers/student.controller.js";
import { addComment, getStudentComments } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { studentCreateSchema, studentUpdateSchema } from "../validators/student.validator.js";
import { commentCreateSchema } from "../validators/comment.validator.js"; // 🚀 Zod Validator for comments
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/public/search", publicSearchStudent);
router.get("/public/:id", getPublicStudentById);

// PROTECTED ROUTES
router.use(verifyToken);

// READ OPERATIONS
router.get("/all", requirePermission("view_students"), injectBranchFilter, getAllStudents);
router.get("/search", requirePermission("view_students"), injectBranchFilter, searchStudent);
router.get("/admin/:id", requirePermission("view_students"), getAdminStudentById);

// WRITE OPERATIONS
router.post("/create", requirePermission("add_student"), upload.single("photo"), validate(studentCreateSchema), addStudent);
router.put("/update/:id", requirePermission("edit_student"), upload.single("photo"), validate(studentUpdateSchema), updateStudent);

// STATUS & MEDIA
router.patch("/toggle-status/:id", requirePermission("edit_student"), toggleStudentStatus);
router.delete("/remove-image/:id", requirePermission("edit_student"), removeStudentImage);
router.delete("/delete/:id", requirePermission("delete_student"), deleteStudent);

// COMMENTS
router.post("/:studentId/comments", requirePermission("add_comment"), validate(commentCreateSchema), addComment);
router.get("/:studentId/comments", requirePermission("view_students"), getStudentComments);

export default router;