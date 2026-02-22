import Student from "../models/student.js";
import Course from "../models/course.js";

// Checks DB for duplicate IDs or Reg Numbers (ignores current student during updates)
export const validateStudentDuplicates = async (studentId, regNumber, excludeDbId = null) => {
  if (!studentId && !regNumber) return null;

  const query = { $or: [] };
  if (studentId) query.$or.push({ student_id: new RegExp(`^${studentId.trim()}$`, "i") });
  if (regNumber) query.$or.push({ registration_number: new RegExp(`^${regNumber.trim()}$`, "i") });

  if (excludeDbId) query._id = { $ne: excludeDbId };

  const existing = await Student.findOne(query).select('student_id registration_number');
  
  if (existing) {
    if (studentId && existing.student_id.toLowerCase() === studentId.trim().toLowerCase()) {
      return `Student ID "${studentId}" already exists`;
    }
    return `Registration Number "${regNumber}" already exists`;
  }
  return null;
};

// Validates course existence and returns necessary embedded fields
export const validateAndFetchCourse = async (courseId) => {
  if (!courseId) return null;
  const course = await Course.findById(courseId).select('course_name course_code duration');
  if (!course) throw new Error("Invalid course selected");
  return course;
};

// Sanitizes standard strings, handles FormData booleans, and injects file/course data
export const sanitizeStudentPayload = (data, courseData = null, filename = null) => {
  const payload = { ...data };

  // 1. Trim strings & format emails
  const stringFields = [
    'student_name', 'fathers_name', 'student_id', 'registration_number', 
    'gender', 'batch', 'status', 'contact_number', 'email', 'address', 'competency'
  ];
  
  stringFields.forEach(field => {
    if (typeof payload[field] === 'string') payload[field] = payload[field].trim();
  });
  if (payload.email) payload.email = payload.email.toLowerCase();

  // 2. Parse FormData Booleans
  if (payload.is_active !== undefined) payload.is_active = payload.is_active === "true" || payload.is_active === true;
  if (payload.is_verified !== undefined) payload.is_verified = payload.is_verified === "true" || payload.is_verified === true;

  // 3. Denormalize Course Data
  if (courseData) {
    payload.course_name = courseData.course_name;
    payload.course_code = courseData.course_code;
    payload.course_duration = courseData.duration;
  }

  // 4. Inject File Path
  if (filename) {
    payload.photo_url = `/uploads/students/${filename}`;
  }

  // Remove undefined properties so Mongoose doesn't overwrite existing data on updates
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  return payload;
};