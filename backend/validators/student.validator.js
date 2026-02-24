import Student from "../models/student.js";
import Course from "../models/course.js";
import { deleteLocalFile } from "../middlewares/multer.js";

// Helper to clean up uploaded files if a request fails
const cleanupFailedUpload = (file) => {
  if (file) deleteLocalFile(`/uploads/students/${file.filename}`);
};

// 1. Check Required Fields Middleware
export const validateRequiredFields = (req, res, next) => {
  const requiredFields = ['student_name', 'fathers_name', 'student_id', 'gender', 'course', 'competency', 'batch', 'status', 'issue_date'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    cleanupFailedUpload(req.file);
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }
  next();
};

// 2. Check Duplicates Middleware
export const checkStudentDuplicates = async (req, res, next) => {
  try {
    const studentId = req.body.student_id;
    const regNumber = req.body.registration_number;
    const excludeDbId = req.params.id || null; // If updating, ignore current student

    if (!studentId && !regNumber) return next();

    const query = { $or: [] };
    if (studentId) query.$or.push({ student_id: new RegExp(`^${studentId.trim()}$`, "i") });
    if (regNumber) query.$or.push({ registration_number: new RegExp(`^${regNumber.trim()}$`, "i") });
    if (excludeDbId) query._id = { $ne: excludeDbId };

    const existing = await Student.findOne(query).select('student_id registration_number');
    
    if (existing) {
      cleanupFailedUpload(req.file);
      if (studentId && existing.student_id.toLowerCase() === studentId.trim().toLowerCase()) {
        return res.status(400).json({ message: `Student ID "${studentId}" already exists` });
      }
      return res.status(400).json({ message: `Registration Number "${regNumber}" already exists` });
    }
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(500).json({ message: "Error validating duplicates" });
  }
};

// 3. Fetch Course & Sanitize Payload Middleware
export const processStudentPayload = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Trim strings & format emails
    const stringFields = ['student_name', 'fathers_name', 'student_id', 'registration_number', 'gender', 'batch', 'status', 'contact_number', 'email', 'address', 'competency'];
    stringFields.forEach(field => {
      if (typeof payload[field] === 'string') payload[field] = payload[field].trim();
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    // Parse Booleans
    if (payload.is_active !== undefined) payload.is_active = payload.is_active === "true" || payload.is_active === true;
    if (payload.is_verified !== undefined) payload.is_verified = payload.is_verified === "true" || payload.is_verified === true;

    // Fetch and Denormalize Course Data
    if (payload.course) {
      const course = await Course.findById(payload.course).select('course_name course_code duration');
      if (!course) throw new Error("Invalid course selected");
      
      payload.course_name = course.course_name;
      payload.course_code = course.course_code;
      payload.course_duration = course.duration;
    }

    // Inject File Path
    if (req.file) {
      payload.photo_url = `/uploads/students/${req.file.filename}`;
    }

    // Remove undefined properties
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    // Attach sanitized payload back to request body for the controller
    req.body = payload;
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(400).json({ message: error.message });
  }
};