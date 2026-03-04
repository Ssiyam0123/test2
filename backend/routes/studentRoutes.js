import express from "express";
import { 
  addStudent, getAllStudents, deleteStudent, getAdminStudentById, 
  updateStudent, toggleStudentStatus, removeStudentImage,
  searchStudent, publicSearchStudent, getPublicStudentById
} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { studentCreateSchema, studentUpdateSchema } from "../validators/student.validator.js";
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js"; // 🚀 Updated Middleware
import { addComment, getStudentComments } from "../controllers/comment.controller.js";

const router = express.Router();

// ==========================================
// 1. PUBLIC ROUTES (No Login Required)
// Used for the student/certificate verification portal
// ==========================================
router.get("/public/search", publicSearchStudent);
router.get("/public/:id", getPublicStudentById);

// ==========================================
// 2. PROTECTED ROUTES (Requires Login & Permissions)
// ==========================================
router.use(verifyToken);

// ----- READ OPERATIONS -----
// 🚀 injectBranchFilter applied for data isolation
router.get("/all", requirePermission("view_students"), injectBranchFilter, getAllStudents);
router.get("/search", requirePermission("view_students"), injectBranchFilter, searchStudent);
router.get("/admin/:id", requirePermission("view_students"), getAdminStudentById);

// ----- WRITE OPERATIONS -----
router.post(
  "/create", 
  requirePermission("add_student"), 
  upload.single("photo"), 
  validate(studentCreateSchema), 
  addStudent
);

router.put(
  "/update/:id", 
  requirePermission("edit_student"), 
  upload.single("photo"), 
  validate(studentUpdateSchema), 
  updateStudent
);

// ----- STATUS & MEDIA -----
router.patch("/toggle-status/:id", requirePermission("edit_student"), toggleStudentStatus);
router.delete("/remove-image/:id", requirePermission("edit_student"), removeStudentImage);

// ----- DELETE OPERATIONS -----
router.delete("/delete/:id", requirePermission("delete_student"), deleteStudent);

// ----- COMMENTS -----
router.post("/:studentId/comments", requirePermission("add_comment"), addComment);
router.get("/:studentId/comments", requirePermission("view_students"), getStudentComments);

export default router;