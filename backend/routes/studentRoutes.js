import express from "express";
import * as studentCtrl from "../controllers/student.controller.js";
import { addComment, deleteComment, getStudentComments } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.js";
import { validate } from "../middlewares/validate.js";
import { studentCreateSchema, studentUpdateSchema } from "../validators/student.validator.js";
import { commentCreateSchema } from "../validators/comment.validator.js"; 
import { verifyToken, requirePermission, injectBranchFilter } from "../middlewares/auth.js";

const router = express.Router();

// Public Routes (No Token Required)
router.get("/public/search", studentCtrl.publicSearchStudent);
router.get("/public/:id", studentCtrl.getPublicStudentById);

// Protected Routes
router.use(verifyToken);

router.get("/all", requirePermission("view_students"), injectBranchFilter, studentCtrl.getAllStudents);
router.get("/search", requirePermission("view_students"), injectBranchFilter, studentCtrl.searchStudent);
router.get("/admin/:id", requirePermission("view_students"), injectBranchFilter, studentCtrl.getAdminStudentById);

router.post("/create", requirePermission("add_student"), upload.single("photo"), validate(studentCreateSchema), studentCtrl.addStudent);
router.put("/update/:id", requirePermission("edit_student"), upload.single("photo"), validate(studentUpdateSchema), studentCtrl.updateStudent);
router.patch("/toggle-status/:id", requirePermission("edit_student"), studentCtrl.toggleStudentStatus);
router.delete("/remove-image/:id", requirePermission("edit_student"), studentCtrl.removeStudentImage);
router.delete("/delete/:id", requirePermission("delete_student"), studentCtrl.deleteStudent);

// Comments
router.post("/:studentId/comments", requirePermission("add_comment"), validate(commentCreateSchema), addComment);
router.get("/:studentId/comments", requirePermission("view_students"), getStudentComments);
router.delete("/comments/:commentId", requirePermission("add_comment"), deleteComment);

export default router;