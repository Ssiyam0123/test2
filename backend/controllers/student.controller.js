import Student from "../models/student.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import { deleteLocalFile } from "../middlewares/multer.js";
import mongoose from "mongoose";


export const addStudent = async (req, res) => {
  try {
    // 1. Create the student
    const student = await Student.create(req.body);

    // 2. Automatically push the new student's ID into the Batch's students array
    if (student.batch) {
      await Batch.findByIdAndUpdate(
        student.batch,
        {
          $push: {
            students: student._id,
          },
        },
        { new: true }, // returns updated document
      );
    }

    res
      .status(201)
      .json({ message: "Student created successfully", data: student });
  } catch (error) {
    if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
    if (error.code === 11000)
      return res.status(400).json({ message: `Duplicate key error` });
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
      return res.status(404).json({ message: "Student not found" });
    }

    // Capture the old batch ID before applying updates
    const oldBatchId = student.batch?.toString();
    const newBatchId = req.body.batch?.toString();

    // If a new file was uploaded, delete the old one from the server
    if (req.file && student.photo_url) {
      deleteLocalFile(student.photo_url);
    }

    // Apply updates and save
    Object.assign(student, req.body);
    await student.save();

    // Handle Batch Transfer Logic
    if (newBatchId && oldBatchId !== newBatchId) {
      // 1. Remove student ID from the old batch
      if (oldBatchId) {
        await Batch.findByIdAndUpdate(oldBatchId, {
          $pull: { students: student._id },
        });
      }
      // 2. Add student ID to the new batch
      await Batch.findByIdAndUpdate(newBatchId, {
        $push: { students: student._id },
      });
    }

    res
      .status(200)
      .json({ message: "Student updated successfully", data: student });
  } catch (error) {
    if (req.file) deleteLocalFile(`/uploads/students/${req.file.filename}`);
    if (error.code === 11000)
      return res.status(400).json({ message: `Duplicate key error` });
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const batchId = student.batch;

    // 1. Delete the photo
    if (student.photo_url) deleteLocalFile(student.photo_url);

    // 2. Delete the student document
    await student.deleteOne();

    // 3. Remove the student ID from the associated Batch
    if (batchId) {
      await Batch.findByIdAndUpdate(batchId, {
        $pull: { students: student._id },
      });
    }

    res.status(200).json({ message: "Student deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const getAllStudents = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 30;
//     const skip = (page - 1) * limit;

//     const {
//       search,
//       status,
//       batch,
//       course,
//       is_active,
//       competency,
//       date_from,
//       date_to,
//     } = req.query;
//     let filter = {};

//     if (search) {
//       const searchRegex = { $regex: search, $options: "i" };
//       filter.$or = [
//         { student_name: searchRegex },
//         { student_id: searchRegex },
//         { registration_number: searchRegex },
//         { fathers_name: searchRegex },
//         { email: searchRegex },
//         { contact_number: searchRegex },
//       ];
//     }

//     // 2. Exact Match Filters
//     if (status && status !== "all") filter.status = status;
//     if (competency && competency !== "all") filter.competency = competency;
//     if (is_active && is_active !== "all")
//       filter.is_active = is_active === "true";

//     // Validate ObjectIds before assigning them to the filter to prevent CastErrors
//     if (batch && batch !== "all") {
//       if (mongoose.Types.ObjectId.isValid(batch)) filter.batch = batch;
//     }
//     if (course && course !== "all") {
//       if (mongoose.Types.ObjectId.isValid(course)) filter.course = course;
//     }

//     // 3. Date Filters
//     if (date_from || date_to) {
//       filter.issue_date = {};
//       if (date_from) filter.issue_date.$gte = new Date(date_from);
//       if (date_to) filter.issue_date.$lte = new Date(date_to);
//     }


//     const [
//       students,
//       total,
//       rawDistinctBatches,
//       distinctCourses,
//       distinctStatuses,
//       distinctCompetencies,
//     ] = await Promise.all([
//       Student.find(filter)
//         .populate("course", "course_name course_code duration fee")
//         .populate("batch", "batch_name batch_type time_slot")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Student.countDocuments(filter),
//       Student.distinct("batch"), 
//       Course.find().select("_id course_name"),
//       Student.distinct("status"),
//       Student.distinct("competency"),
//     ]);

//     const validBatchIds = rawDistinctBatches.filter((id) =>
//       mongoose.Types.ObjectId.isValid(id),
//     );

//     // Only query Batch model with valid ObjectIds
//     const distinctBatches =
//       validBatchIds.length > 0
//         ? await Batch.find({ _id: { $in: validBatchIds } }).select(
//             "_id batch_name",
//           )
//         : [];

//         console.log(distinctBatches)

//     res.status(200).json({
//       data: students,
//       pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
//       filters: {
//         batches: distinctBatches,
//         courses: distinctCourses,
//         statuses: distinctStatuses.filter(Boolean).sort(),
//         competencies: distinctCompetencies.filter(Boolean).sort(),
//       },
//     });
//   } catch (error) {
//     // Log the actual error to your terminal so you can see exactly what failed
//     console.error("GET_ALL_STUDENTS ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };





export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // 1. Destructure 'branch' from the query parameters
    const { search, status, batch, course, is_active, competency, branch } = req.query;

    // 2. Initialize filter with branch isolation (from your middleware)
    let filter = { ...req.branchFilter }; 

    // ==========================================
    // 3. SECURE BRANCH FILTERING LOGIC
    // ==========================================
    if (req.user.role === "admin") {
      // If Super Admin selects a specific branch, apply it. 
      // Otherwise, stay global (filter stays empty or uses branch query).
      if (branch && branch !== "all" && mongoose.Types.ObjectId.isValid(branch)) {
        filter.branch = branch;
      }
    } else {
      // Registrar/Instructor: Forced to their own branch via middleware
      filter.branch = req.user.branch;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { student_name: searchRegex },
        { student_id: searchRegex },
        { registration_number: searchRegex },
        { email: searchRegex },
      ];
    }

    // Apply exact match filters
    if (status && status !== "all") filter.status = status;
    if (competency && competency !== "all") filter.competency = competency;
    if (is_active && is_active !== "all") filter.is_active = is_active === "true";

    // Validate and apply Batch/Course filters
    if (batch && batch !== "all" && mongoose.Types.ObjectId.isValid(batch)) filter.batch = batch;
    if (course && course !== "all" && mongoose.Types.ObjectId.isValid(course)) filter.course = course;

    // 4. Database Queries
    const [
      students,
      total,
      rawDistinctBatches,
      distinctCourses,
    ] = await Promise.all([
      Student.find(filter)
        .populate("course", "course_name course_code duration fee")
        .populate("batch", "batch_name batch_type time_slot")
        .populate("branch", "branch_name branch_code") // Ensure branch info is available for the table
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
      // Only get distinct batches for the currently filtered set of students
      Student.distinct("batch", filter), 
      Course.find({ is_active: true }).select("_id course_name").lean(),
    ]);

    const validBatchIds = rawDistinctBatches.filter(id => mongoose.Types.ObjectId.isValid(id));
    const distinctBatches = validBatchIds.length > 0
      ? await Batch.find({ _id: { $in: validBatchIds } }).select("_id batch_name").lean()
      : [];

    res.status(200).json({
      success: true,
      data: students,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      filters: {
        batches: distinctBatches.map(b => ({ _id: b._id.toString(), batch_name: b.batch_name })),
        courses: distinctCourses.map(c => ({ _id: c._id.toString(), course_name: c.course_name })),
      },
    });
  } catch (error) {
    console.error("GET_ALL_STUDENTS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




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
};

export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.is_active = !student.is_active;
    await student.save();

    res.status(200).json({
      message: `Student ${student.is_active ? "activated" : "deactivated"} successfully`,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      .populate("batch", "batch_name batch_type time_slot schedule_days")
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

export const getPublicStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate(
        "course",
        "course_name course_code duration description additional_info",
      )
      .populate("batch", "batch_name batch_type time_slot schedule_days");

    if (!student || !student.is_active) {
      return res.status(404).json({ message: "Student not found or inactive" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      .populate("batch", "batch_name batch_type time_slot")
      .populate({
        path: "comments",
        populate: { path: "instructor", select: "full_name photo_url" },
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

export const getAdminStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate(
        "course",
        "course_name course_code duration description additional_info",
      )
      .populate("batch", "batch_name batch_type time_slot")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "instructor",
          select: "full_name photo_url designation",
        },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


