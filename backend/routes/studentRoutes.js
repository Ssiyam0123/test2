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
  removeStudentImage
} from "../controllers/student.controller.js";
import protectRoute from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import { addComment, getStudentComments } from "../controllers/comment.controller.js";

// Import our new middlewares
import { 
  validateRequiredFields, 
  checkStudentDuplicates, 
  processStudentPayload 
} from "../validators/student.validator.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
router.get("/public/search", publicSearchStudent);
router.get("/public/:id", getPublicStudentById);

// ==========================================
// GENERAL PROTECTED ROUTES
// ==========================================
router.get("/all", protectRoute, authorize("admin", "registrar", "instructor"), getAllStudents);

// ==========================================
// INSTRUCTOR & ADMIN ROUTES (Comments)
// ==========================================
router.post("/:studentId/comments", protectRoute, authorize("admin", "instructor"), addComment);
router.get("/:studentId/comments", protectRoute, authorize("admin", "instructor"), getStudentComments);

// ==========================================
// REGISTRAR & ADMIN ROUTES (Core CRUD)
// ==========================================
router.post(
  "/create",
  protectRoute,
  authorize("admin", "registrar"),
  upload.single("photo"),
  validateRequiredFields, // 1. Check if fields exist
  checkStudentDuplicates, // 2. Check DB for duplicates
  processStudentPayload,  // 3. Format strings and fetch course info
  addStudent              // 4. Finally, save to DB
);

router.put(
  "/update/:id",
  protectRoute,
  authorize("admin", "registrar"),
  upload.single("photo"),
  checkStudentDuplicates, // 1. Check DB for duplicates (ignores self)
  processStudentPayload,  // 2. Format strings and fetch course info
  updateStudent           // 3. Finally, update DB
);

router.patch("/toggle-status/:id", protectRoute, authorize("admin", "registrar"), toggleStudentStatus);
router.delete("/remove-image/:id", protectRoute, authorize("admin", "registrar"), removeStudentImage);
router.delete("/delete/:id", protectRoute, authorize("admin", "registrar"), deleteStudent);
router.get("/search", protectRoute, authorize("admin", "registrar"), searchStudent);
router.get("/admin/:id", protectRoute, authorize("admin", "registrar"), getAdminStudentById);

export default router;