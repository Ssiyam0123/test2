import express from "express";
import * as studentCtrl from "../controllers/student.controller.js";
import {
  addComment,
  deleteComment,
  getStudentComments,
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import {
  studentCreateSchema,
  studentUpdateSchema,
} from "../validators/student.validator.js";
import { commentCreateSchema } from "../validators/comment.validator.js";
import {
  verifyToken,
  requirePermission,
  injectBranchFilter,
} from "../middlewares/auth.js";
import { PERMISSIONS } from "../constants/permissions.js";

const router = express.Router();

// Public Routes
router.get("/public/search", studentCtrl.publicSearchStudent);
router.get("/public/:id", studentCtrl.getPublicStudentById);

// Protected Routes
router.use(verifyToken);

router.get(
  "/all",
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  injectBranchFilter,
  studentCtrl.getAllStudents,
);
router.get(
  "/search",
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  injectBranchFilter,
  studentCtrl.searchStudent,
);
router.get(
  "/admin/:id",
  requirePermission(PERMISSIONS.VIEW_STUDENT_DETAILS),
  injectBranchFilter,
  studentCtrl.getAdminStudentById,
);

router.post(
  "/create",
  requirePermission(PERMISSIONS.ADD_STUDENT),
  upload.single("photo"),
  validate(studentCreateSchema),
  studentCtrl.addStudent,
);
router.put(
  "/update/:id",
  requirePermission(PERMISSIONS.EDIT_STUDENT),
  upload.single("photo"),
  validate(studentUpdateSchema),
  studentCtrl.updateStudent,
);
router.patch(
  "/toggle-status/:id",
  requirePermission(PERMISSIONS.EDIT_STUDENT),
  studentCtrl.toggleStudentStatus,
);
router.delete(
  "/remove-image/:id",
  requirePermission(PERMISSIONS.EDIT_STUDENT),
  studentCtrl.removeStudentImage,
);
router.delete(
  "/delete/:id",
  requirePermission(PERMISSIONS.DELETE_STUDENT),
  studentCtrl.deleteStudent,
);

// Comments
router.post(
  "/:studentId/comments",
  requirePermission(PERMISSIONS.ADD_STUDENT_COMMENT),
  validate(commentCreateSchema),
  addComment,
);
router.get(
  "/:studentId/comments",
  requirePermission(PERMISSIONS.VIEW_STUDENT_DETAILS),
  getStudentComments,
);
router.delete(
  "/comments/:commentId",
  requirePermission(PERMISSIONS.ADD_STUDENT_COMMENT),
  deleteComment,
);

export default router;
