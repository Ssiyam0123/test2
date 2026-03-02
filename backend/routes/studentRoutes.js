import express from "express";
import { 
  addStudent, 
  getAllStudents, 
  deleteStudent, 
  getAdminStudentById, 
  updateStudent, 
  toggleStudentStatus,
  removeStudentImage,
  searchStudent,
  publicSearchStudent,
  getPublicStudentById,

} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { studentCreateSchema, studentUpdateSchema } from "../validators/student.validator.js";
import { verifyToken, requirePermission, branchGuard } from "../middlewares/auth.js";
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
router.get("/all", requirePermission("view_students"), branchGuard, getAllStudents);
router.get("/search", requirePermission("view_students"), branchGuard, searchStudent);

// 🚀 FIXED: Matches frontend API.get(`/students/admin/${id}`)
router.get("/admin/:id", requirePermission("view_students"), getAdminStudentById);

// ----- WRITE OPERATIONS -----
router.post(
  "/create", 
  requirePermission("add_student"), 
  upload.single("photo"), 
  validate(studentCreateSchema), 
  addStudent
);

// 🚀 FIXED: Matches frontend API.put(`/students/update/${id}`)
router.put(
  "/update/:id", 
  requirePermission("edit_student"), 
  upload.single("photo"), 
  validate(studentUpdateSchema), 
  updateStudent
);

// ----- STATUS & MEDIA -----
// 🚀 FIXED: Matches frontend API.patch(`/students/toggle-status/${id}`)
router.patch("/toggle-status/:id", requirePermission("edit_student"), toggleStudentStatus);

// 🚀 FIXED: Matches frontend API.delete(`/students/remove-image/${id}`)
router.delete("/remove-image/:id", requirePermission("edit_student"), removeStudentImage);

// ----- DELETE OPERATIONS -----
// 🚀 FIXED: Matches frontend API.delete(`/students/delete/${id}`)
router.delete("/delete/:id", requirePermission("delete_student"), deleteStudent);

// Add these to your existing student.routes.js
router.post("/:studentId/comments", verifyToken, requirePermission("add_comment"), addComment);
router.get("/:studentId/comments", verifyToken, requirePermission("view_students"), getStudentComments);

export default router;