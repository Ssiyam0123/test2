// import Student from "../models/student.js";
// import Course from "../models/course.js";
// import { deleteLocalFile } from "../middlewares/multer.js";

// Get all students with pagination and filters
// export const getAllStudents = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;

//     const { search, status, batch, course, is_active, competency, date_from, date_to } = req.query;

//     let filter = {};

//     if (search) {
//       filter.$or = [
//         { student_name: { $regex: search, $options: "i" } },
//         { student_id: { $regex: search, $options: "i" } },
//         { registration_number: { $regex: search, $options: "i" } },
//         { fathers_name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { contact_number: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (status && status !== "all") filter.status = status;
//     if (batch && batch !== "all") filter.batch = batch;
//     if (course && course !== "all") filter.course = course;
//     if (competency && competency !== "all") filter.competency = competency;
//     if (is_active && is_active !== "all") filter.is_active = is_active === "true";

//     if (date_from || date_to) {
//       filter.issue_date = {};
//       if (date_from) filter.issue_date.$gte = new Date(date_from);
//       if (date_to) filter.issue_date.$lte = new Date(date_to);
//     }

//     const distinctBatches = await Student.distinct("batch");
//     const distinctCourses = await Course.find().select("_id course_name");
//     const distinctStatuses = await Student.distinct("status");
//     const distinctCompetencies = await Student.distinct("competency");

//     const [students, total] = await Promise.all([
//       Student.find(filter)
//         .populate("course", "course_name course_code duration fee")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Student.countDocuments(filter),
//     ]);

//     res.status(200).json({
//       data: students,
//       pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
//       filters: {
//         batches: distinctBatches.filter(b => b).sort(),
//         courses: distinctCourses,
//         statuses: distinctStatuses.filter(s => s).sort(),
//         competencies: distinctCompetencies.filter(c => c).sort(),
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const deleteStudent = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     if (student.photo_url) {
//       deleteLocalFile(student.photo_url);
//     }

//     await student.deleteOne();

//     res.status(200).json({ message: "Student deleted permanently" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const updateStudent = async (req, res) => {
//   let uploadedFilePath = null;

//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) {
//       if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
//       return res.status(404).json({ message: "Student not found" });
//     }

//     if (req.file) {
//       if (student.photo_url) {
//         deleteLocalFile(student.photo_url);
//       }
//       uploadedFilePath = `/uploads/students/${req.file.filename}`;
//       student.photo_url = uploadedFilePath;
//     }

//     const {
//       student_name, fathers_name, student_id, registration_number,
//       gender, course, competency, batch, status, issue_date, completion_date,
//       is_active, is_verified, contact_number, email, address,
//     } = req.body;

//     if (student_id || registration_number) {
//       const existingStudent = await Student.findOne({
//         _id: { $ne: req.params.id },
//         $or: [
//           ...(student_id ? [{ student_id: student_id.trim() }] : []),
//           ...(registration_number ? [{ registration_number: registration_number.trim() }] : []),
//         ],
//       });

//       if (existingStudent) {
//         if (student_id && existingStudent.student_id === student_id.trim()) {
//           return res.status(400).json({ message: "Student ID already exists" });
//         }
//         if (registration_number && existingStudent.registration_number === registration_number.trim()) {
//           return res.status(400).json({ message: "Registration Number already exists" });
//         }
//       }
//     }

//     if (student_name !== undefined) student.student_name = student_name.trim();
//     if (fathers_name !== undefined) student.fathers_name = fathers_name.trim();
//     if (student_id !== undefined) student.student_id = student_id.trim();
//     if (registration_number !== undefined) student.registration_number = registration_number.trim();
//     if (gender !== undefined) student.gender = gender.trim(); 
//     if (competency !== undefined) student.competency = competency;
//     if (batch !== undefined) student.batch = batch.trim();
//     if (status !== undefined) student.status = status;
//     if (issue_date !== undefined) student.issue_date = issue_date;
//     if (completion_date !== undefined) student.completion_date = completion_date || null;
    
//     if (is_active !== undefined) student.is_active = is_active === "true" || is_active === true;
//     if (is_verified !== undefined) student.is_verified = is_verified === "true" || is_verified === true;
    
//     if (contact_number !== undefined) student.contact_number = contact_number?.trim() || "";
//     if (email !== undefined) student.email = email?.trim().toLowerCase() || "";
//     if (address !== undefined) student.address = address?.trim() || "";

//     const oldCourseId = student.course?.toString();

//     if (course !== undefined) {
//       student.course = course;
//     }

//     if (course && course !== oldCourseId) {
//       const courseData = await Course.findById(course);
//       if (!courseData) {
//         return res.status(400).json({ message: "Invalid course selected" });
//       }
//       student.course_name = courseData.course_name;
//       student.course_code = courseData.course_code;
//       student.course_duration = {
//         value: courseData.duration?.value ?? courseData.duration ?? 0,
//         unit: courseData.duration?.unit ?? "months",
//       };
//     }

//     try {
//       await student.validate();
//     } catch (validationError) {
//       if (uploadedFilePath) deleteLocalFile(uploadedFilePath);
//       return res.status(400).json({ message: validationError.message });
//     }

//     await student.save();

//     res.status(200).json({
//       message: "Student updated successfully",
//       data: student,
//     });

//   } catch (error) {
//     if (uploadedFilePath) deleteLocalFile(uploadedFilePath);

//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: `Duplicate key error: ${JSON.stringify(error.keyValue)}`,
//       });
//     }

//     res.status(500).json({
//       message: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };

// export const addStudent = async (req, res) => {
//   let uploadedFilePath = null;

//   try {
//     const {
//       student_name, fathers_name, student_id, registration_number,
//       gender, course, competency, batch, status, issue_date, completion_date,
//       is_active, is_verified, contact_number, email, address,
//     } = req.body;

//     const existingStudent = await Student.findOne({
//       $or: [
//         { student_id: { $regex: new RegExp(`^${student_id.trim()}$`, "i") } },
//         { registration_number: { $regex: new RegExp(`^${registration_number.trim()}$`, "i") } },
//       ],
//     });

//     if (existingStudent) {
//       if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);

//       if (existingStudent.student_id.toLowerCase() === student_id.toLowerCase().trim()) {
//         return res.status(400).json({ message: `Student ID "${student_id}" already exists` });
//       }
//       if (existingStudent.registration_number.toLowerCase() === registration_number.toLowerCase().trim()) {
//         return res.status(400).json({ message: `Registration Number "${registration_number}" already exists` });
//       }
//     }

//     if (!student_name || !fathers_name || !student_id || !registration_number || !gender || !course || !competency || !batch || !status || !issue_date) {
//       if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
//       return res.status(400).json({ message: "All required fields must be filled" });
//     }

//     const courseData = await Course.findById(course);
//     if (!courseData) {
//       if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
//       return res.status(400).json({ message: "Invalid course selected" });
//     }

//     let photo_url = "";
//     if (req.file) {
//       photo_url = `/uploads/students/${req.file.filename}`;
//       uploadedFilePath = photo_url;
//     }

//     const isActiveBool = is_active === "true" || is_active === true;
//     const isVerifiedBool = is_verified === "true" || is_verified === true;

//     const studentData = {
//       student_name: student_name.trim(),
//       fathers_name: fathers_name.trim(),
//       student_id: student_id.trim(),
//       registration_number: registration_number.trim(),
//       gender: gender.trim(),
//       course,
//       course_name: courseData.course_name,
//       course_code: courseData.course_code,
//       course_duration: courseData.duration,
//       competency,
//       batch: batch.trim(),
//       status,
//       issue_date,
//       completion_date: completion_date || null,
//       is_active: isActiveBool,
//       is_verified: isVerifiedBool,
//       contact_number: contact_number ? contact_number.trim() : "",
//       email: email ? email.trim().toLowerCase() : "",
//       address: address ? address.trim() : "",
//       photo_url,
//     };

//     const student = await Student.create(studentData);

//     res.status(201).json({
//       message: "Student created successfully",
//       data: student,
//     });
//   } catch (error) {
//     if (uploadedFilePath) deleteLocalFile(uploadedFilePath);

//     if (error.code === 11000) {
//       return res.status(400).json({
//         message: `Duplicate key error: ${JSON.stringify(error.keyValue)}`,
//       });
//     }
//     res.status(500).json({
//       message: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };



import Student from "../models/student.js";
import Course from "../models/course.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import { 
  validateStudentDuplicates, 
  validateAndFetchCourse, 
  sanitizeStudentPayload 
} from "../validators/student.validator.js";

// Helper to clean up uploaded files if a request fails
const cleanupFailedUpload = (file) => {
  if (file) deleteLocalFile(`/uploads/students/${file.filename}`);
};

export const addStudent = async (req, res) => {
  try {
    const requiredFields = ['student_name', 'fathers_name', 'student_id', 'registration_number', 'gender', 'course', 'competency', 'batch', 'status', 'issue_date'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      cleanupFailedUpload(req.file);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const duplicateError = await validateStudentDuplicates(req.body.student_id, req.body.registration_number);
    if (duplicateError) {
      cleanupFailedUpload(req.file);
      return res.status(400).json({ message: duplicateError });
    }

    const courseData = await validateAndFetchCourse(req.body.course);
    const studentData = sanitizeStudentPayload(req.body, courseData, req.file?.filename);

    const student = await Student.create(studentData);

    res.status(201).json({ message: "Student created successfully", data: student });
  } catch (error) {
    cleanupFailedUpload(req.file);
    if (error.code === 11000) return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      cleanupFailedUpload(req.file);
      return res.status(404).json({ message: "Student not found" });
    }

    const duplicateError = await validateStudentDuplicates(req.body.student_id, req.body.registration_number, student._id);
    if (duplicateError) {
      cleanupFailedUpload(req.file);
      return res.status(400).json({ message: duplicateError });
    }

    const courseData = req.body.course && req.body.course !== student.course?.toString() 
      ? await validateAndFetchCourse(req.body.course) 
      : null;

    const updatedData = sanitizeStudentPayload(req.body, courseData, req.file?.filename);

    // If a new file was uploaded and sanitized, remove the old one from the server
    if (req.file && student.photo_url) {
      deleteLocalFile(student.photo_url);
    }

    Object.assign(student, updatedData);
    await student.save();

    res.status(200).json({ message: "Student updated successfully", data: student });
  } catch (error) {
    cleanupFailedUpload(req.file);
    if (error.code === 11000) return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const { search, status, batch, course, is_active, competency, date_from, date_to } = req.query;
    let filter = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { student_name: searchRegex },
        { student_id: searchRegex },
        { registration_number: searchRegex },
        { fathers_name: searchRegex },
        { email: searchRegex },
        { contact_number: searchRegex },
      ];
    }

    if (status && status !== "all") filter.status = status;
    if (batch && batch !== "all") filter.batch = batch;
    if (course && course !== "all") filter.course = course;
    if (competency && competency !== "all") filter.competency = competency;
    if (is_active && is_active !== "all") filter.is_active = is_active === "true";

    if (date_from || date_to) {
      filter.issue_date = {};
      if (date_from) filter.issue_date.$gte = new Date(date_from);
      if (date_to) filter.issue_date.$lte = new Date(date_to);
    }

    const [students, total, distinctBatches, distinctCourses, distinctStatuses, distinctCompetencies] = await Promise.all([
      Student.find(filter).populate("course", "course_name course_code duration fee").sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
      Student.distinct("batch"),
      Course.find().select("_id course_name"),
      Student.distinct("status"),
      Student.distinct("competency")
    ]);

    res.status(200).json({
      data: students,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: {
        batches: distinctBatches.filter(Boolean).sort(),
        courses: distinctCourses,
        statuses: distinctStatuses.filter(Boolean).sort(),
        competencies: distinctCompetencies.filter(Boolean).sort(),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.photo_url) deleteLocalFile(student.photo_url);
    await student.deleteOne();

    res.status(200).json({ message: "Student deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... keep toggleStudentStatus, removeStudentImage, searchStudent, etc. exactly as they were.

// Remove specific student image
export const removeStudentImage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.photo_url) {
      deleteLocalFile(student.photo_url);
    }

    student.photo_url = "";
    await student.save();

    res.status(200).json({
      message: "Image removed successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Toggle student active status
export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.is_active = !student.is_active;
    await student.save();

    res.status(200).json({
      message: `Student ${
        student.is_active ? "activated" : "deactivated"
      } successfully`,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Admin search student (returns all regardless of status)
// export const searchStudent = async (req, res) => {
//   try {
//     const { query } = req.query;

//     if (!query || query.trim() === "") {
//       return res.status(400).json({ message: "Search query is required" });
//     }

//     const students = await Student.find({
//       $or: [
//         { student_id: { $regex: query.trim(), $options: "i" } },
//         { registration_number: { $regex: query.trim(), $options: "i" } },
//       ],
//     })
//       .populate("course", "course_name course_code duration")
//       .sort({ createdAt: -1 })
//       .limit(20);

//     res.status(200).json({
//       message: "Search completed",
//       data: students,
//       count: students.length,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Public search student (returns strictly active students)
export const publicSearchStudent = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const student = await Student.findOne({
      $or: [
        { student_id: query.trim() },
        { registration_number: query.trim() },
      ],
      is_active: true,
    })
      .populate("course", "course_name course_code duration additional_info")
      .select("-__v"); 

    if (!student) {
      return res.status(404).json({
        message: "Student not found or not active",
        data: null,
      });
    }

    res.status(200).json({
      message: "Student found",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Admin: Fetch student regardless of active status
// export const getAdminStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id).populate(
//       "course",
//       "course_name course_code duration description additional_info"
//     );

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     res.status(200).json(student);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const getPublicStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "course",
      "course_name course_code duration description additional_info"
    );

    if (!student || !student.is_active) {
      return res.status(404).json({ message: "Student not found or inactive" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// Admin search student (Includes Comments)
export const searchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const students = await Student.find({
      $or: [
        { student_id: { $regex: query.trim(), $options: "i" } },
        { registration_number: { $regex: query.trim(), $options: "i" } },
      ],
    })
      .populate("course", "course_name course_code duration")
      // NEW: Populate comments and the instructor's name inside those comments
      .populate({
        path: "comments",
        populate: { path: "instructor", select: "full_name photo_url" }
      })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      message: "Search completed",
      data: students,
      count: students.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Fetch student by ID (Includes Comments)
export const getAdminStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "course_name course_code duration description additional_info")
      // NEW: Deep populate instructor name inside comments
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } }, // Newest comments first
        populate: { 
          path: "instructor", 
          select: "full_name photo_url designation" 
        }
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};