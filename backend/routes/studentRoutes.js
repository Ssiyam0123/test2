import express from "express";
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
  toggleStudentStatus,
  searchStudent,
  publicSearchStudent,
  getAdminStudentById,
  getPublicStudentById,
} from "../controllers/student.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import {
  addComment,
  getStudentComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
router.get("/public/search", publicSearchStudent);
router.get("/public/:id", getPublicStudentById);

// ==========================================
// GENERAL PROTECTED ROUTES
// ==========================================
// Assuming all authenticated staff (Admin, Registrar, Instructor) can view the list
router.get("/all", protectRoute, authorize("admin", "registrar", "instructor"), getAllStudents);

// ==========================================
// INSTRUCTOR & ADMIN ROUTES (Comments)
// ==========================================
router.post(
  "/:studentId/comments",
  protectRoute,
  authorize("admin", "instructor"),
  addComment
);

router.get(
  "/:studentId/comments",
  protectRoute,
  authorize("admin", "instructor"),
  getStudentComments
);

// ==========================================
// REGISTRAR & ADMIN ROUTES (Core CRUD)
// ==========================================
router.post(
  "/create",
  protectRoute,
  authorize("admin", "registrar"),
  upload.single("photo"), 
  addStudent
);

router.put(
  "/update/:id",
  protectRoute,
  authorize("admin", "registrar"),
  upload.single("photo"),
  updateStudent
);

router.patch(
  "/toggle-status/:id",
  protectRoute,
  authorize("admin", "registrar"),
  toggleStudentStatus
);

router.delete(
  "/delete/:id",
  protectRoute,
  authorize("admin", "registrar"),
  deleteStudent
);

router.get(
  "/search",
  protectRoute,
  authorize("admin", "registrar"),
  searchStudent
);

router.get(
  "/admin/:id",
  protectRoute,
  authorize("admin", "registrar"),
  getAdminStudentById
);

export default router;