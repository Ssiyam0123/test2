import mongoose from "mongoose";
import Student from "../models/student.js";
import Course from "../models/course.js";
import { deleteLocalFile } from "../middlewares/multer.js";

// Helper to clean up uploaded files if a request fails validation
const cleanupFailedUpload = (file) => {
  if (file) deleteLocalFile(`/uploads/students/${file.filename}`);
};

// 1. Check Required Fields
export const validateRequiredFields = (req, res, next) => {
  // Note: 'branch' is handled securely in processStudentPayload
  const requiredFields = [
    'student_name', 'fathers_name', 'student_id', 
    'gender', 'course', 'batch', 'issue_date'
  ];
  
  // Checks if field is missing OR if it's just an empty string
  const missingFields = requiredFields.filter(field => !req.body[field] || String(req.body[field]).trim() === '');
  
  if (missingFields.length > 0) {
    cleanupFailedUpload(req.file);
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }
  next();
};

// 2. Check Duplicates (Ensures ID & Reg Numbers are unique)
export const checkStudentDuplicates = async (req, res, next) => {
  try {
    const studentId = req.body.student_id;
    const regNumber = req.body.registration_number;
    const excludeDbId = req.params.id || null; // Used during updates to ignore the current document

    if (!studentId && !regNumber) return next();

    const query = { $or: [] };
    if (studentId) query.$or.push({ student_id: new RegExp(`^${String(studentId).trim()}$`, "i") });
    if (regNumber) query.$or.push({ registration_number: new RegExp(`^${String(regNumber).trim()}$`, "i") });
    
    // If updating, don't check against the student we are currently updating
    if (excludeDbId) query._id = { $ne: excludeDbId };

    if (query.$or.length > 0) {
      const existing = await Student.findOne(query).select('student_id registration_number');
      
      if (existing) {
        cleanupFailedUpload(req.file);
        if (studentId && existing.student_id.toLowerCase() === String(studentId).trim().toLowerCase()) {
          return res.status(400).json({ message: `Student ID "${studentId}" already exists in the system.` });
        }
        return res.status(400).json({ message: `Registration Number "${regNumber}" already exists in the system.` });
      }
    }
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(500).json({ message: "Error validating student duplicates" });
  }
};

// 3. Sanitize Payload, Enforce Branch, & Fetch Course Data
export const processStudentPayload = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // A. Clean and Trim String Fields
    const stringFields = [
      'student_name', 'fathers_name', 'student_id', 
      'registration_number', 'gender', 'status', 
      'contact_number', 'email', 'address', 'competency'
    ];
    stringFields.forEach(field => {
      if (typeof payload[field] === 'string') payload[field] = payload[field].trim();
    });
    if (payload.email) payload.email = payload.email.toLowerCase();

    // B. Parse Booleans Safely
    if (payload.is_active !== undefined) payload.is_active = payload.is_active === "true" || payload.is_active === true;
    if (payload.is_verified !== undefined) payload.is_verified = payload.is_verified === "true" || payload.is_verified === true;

    // ==========================================
    // C. BRANCH ISOLATION SECURITY
    // ==========================================
    // If an Admin provides a branch ID, use it. Otherwise, force the student into the creator's branch.
    payload.branch = (req.user.role === 'admin' && req.body.branch) 
      ? req.body.branch 
      : req.user.branch;

    if (!payload.branch) {
       throw new Error("Branch assignment is mandatory. Please contact a system administrator.");
    }

    // D. Validate ObjectIds to prevent database CastErrors
    if (!mongoose.Types.ObjectId.isValid(payload.branch)) throw new Error("Invalid Branch ID format");
    if (payload.batch && !mongoose.Types.ObjectId.isValid(payload.batch)) throw new Error("Invalid Batch ID format");
    if (payload.course && !mongoose.Types.ObjectId.isValid(payload.course)) throw new Error("Invalid Course ID format");

    // E. Fetch and Denormalize Course Data 
    // (This ensures that if a course is deleted later, the student's historical record remains intact)
    if (payload.course) {
      const course = await Course.findById(payload.course).select('course_name course_code duration');
      if (!course) throw new Error("The selected course does not exist.");
      
      // We attach these to the payload so they are saved directly into the Student document if needed
      payload.course_name = course.course_name;
      payload.course_code = course.course_code;
      payload.course_duration = course.duration;
    }

    // F. Inject Uploaded File Path
    if (req.file) {
      payload.photo_url = `/uploads/students/${req.file.filename}`;
    }

    // G. Remove undefined properties so they don't overwrite existing data during updates
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    // Attach perfectly clean, secure data to the request body for the controller
    req.body = payload; 
    next();
  } catch (error) {
    cleanupFailedUpload(req.file);
    res.status(400).json({ message: error.message });
  }
};