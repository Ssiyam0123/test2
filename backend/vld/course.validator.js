import Course from "../models/course.js";

// 1. Check Required Fields
export const validateCourseFields = (req, res, next) => {
  const { course_name, course_code, duration_value } = req.body;
  const isPost = req.method === "POST";

  const missing = [];
  if (isPost && !course_name) missing.push("course_name");
  if (isPost && !course_code) missing.push("course_code");
  if (isPost && duration_value === undefined) missing.push("duration_value");

  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  if (duration_value !== undefined && isNaN(Number(duration_value))) {
    return res.status(400).json({ message: "Duration value must be a valid number." });
  }

  next();
};

// 2. Database Validation for Duplicates
export const checkCourseDuplicates = async (req, res, next) => {
  try {
    const { course_name, course_code } = req.body;
    const excludeDbId = req.params.id || null;

    const query = { $or: [] };
    if (course_name) query.$or.push({ course_name: new RegExp(`^${course_name.trim()}$`, "i") });
    if (course_code) query.$or.push({ course_code: new RegExp(`^${course_code.trim()}$`, "i") });
    if (excludeDbId) query._id = { $ne: excludeDbId };

    if (query.$or.length > 0) {
      const existingCourse = await Course.findOne(query).select("course_name course_code");

      if (existingCourse) {
        if (course_name && existingCourse.course_name.toLowerCase() === course_name.trim().toLowerCase()) {
          return res.status(400).json({ message: "Course name already exists." });
        }
        if (course_code && existingCourse.course_code.toLowerCase() === course_code.trim().toLowerCase()) {
          return res.status(400).json({ message: "Course code already exists." });
        }
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error validating course uniqueness." });
  }
};

// 3. Sanitize and Structure Payload
export const processCoursePayload = (req, res, next) => {
  try {
    const payload = { ...req.body };

    // Clean strings
    if (payload.course_name) payload.course_name = payload.course_name.trim();
    if (payload.course_code) payload.course_code = payload.course_code.trim();
    if (payload.description) payload.description = payload.description.trim();

    // Map the separated duration variables into the nested Mongoose object
    if (payload.duration_value !== undefined) {
      payload.duration = {
        value: Number(payload.duration_value),
        unit: payload.duration_unit || "months",
      };
      delete payload.duration_value;
      delete payload.duration_unit;
    }

    // Handle Booleans
    if (payload.is_active !== undefined) {
      payload.is_active = payload.is_active === "true" || payload.is_active === true;
    }

    // Handle stringified arrays (e.g., if sent from a text area)
    if (typeof payload.additional_info === "string") {
      payload.additional_info = payload.additional_info.split('\n').filter(item => item.trim() !== '');
    }

    // Clean undefined fields
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

    req.body = payload;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};