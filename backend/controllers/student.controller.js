import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js"; 
import Fee from "../models/fee.js"; 
import { deleteLocalFile } from "../middlewares/multer.js";
import mongoose from "mongoose";
import payment from "../models/payment.js";
import fee from "../models/fee.js";

const getSessionInfo = async () => {
  const session = await mongoose.startSession();
  const isReplicaSet = mongoose.connection
    .getClient()
    .topology.description.type.includes("ReplicaSet");
  return { session, isReplicaSet };
};

export const addStudent = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();

    const course = await Course.findById(req.body.course).session(session);
    if (!course) throw new Error("Selected course not found");

    if (req.file) req.body.photo_url = `/uploads/students/${req.file.filename}`;

    const [student] = await Student.create([req.body], { session });

    await Batch.findByIdAndUpdate(
      student.batch,
      { $push: { students: student._id } },
      { session },
    );

    const baseFee = course.base_fee || 0;
    const discount = Number(req.body.discount_amount) || 0;
    const netPayable = Math.max(0, baseFee - discount);

    await Fee.create(
      [{
        student: student._id,
        branch: student.branch,
        course: student.course,
        total_amount: baseFee,
        discount: discount,
        net_payable: netPayable,
        paid_amount: 0,
        status: netPayable === 0 ? "Paid" : "Unpaid",
      }],
      { session },
    );

    if (isReplicaSet) await session.commitTransaction();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    if (req.file) deleteLocalFile(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const updateStudent = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const oldBatchId = student.batch?.toString();
    const newBatchId = req.body.batch?.toString();

    if (req.file && student.photo_url) deleteLocalFile(student.photo_url);
    if (req.file) req.body.photo_url = `/uploads/students/${req.file.filename}`;

    Object.assign(student, req.body);
    await student.save({ session });

    if (newBatchId && oldBatchId !== newBatchId) {
      if (oldBatchId)
        await Batch.findByIdAndUpdate(oldBatchId, { $pull: { students: student._id } }, { session });
      await Batch.findByIdAndUpdate(newBatchId, { $push: { students: student._id } }, { session });
    }

    if (isReplicaSet) await session.commitTransaction();
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// 2. GET ALL STUDENTS (O(1) Database Trip using Aggregation)
export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const { search, status, branch } = req.query;

    let match = {};
    
    // 1. SAFELY HANDLE THE BRANCH GUARD
    if (req.branchFilter && req.branchFilter.branch) {
      match.branch = new mongoose.Types.ObjectId(req.branchFilter.branch.toString());
    }

    // 2. SAFELY HANDLE THE SUPERADMIN DROPDOWN
    const isMaster = req.user?.role?.name === "superadmin" || (Array.isArray(req.user?.role?.permissions) && req.user.role.permissions.includes("all_access"));
    
    if (isMaster && branch && branch !== "all" && branch !== "") {
      if (mongoose.Types.ObjectId.isValid(branch)) {
         match.branch = new mongoose.Types.ObjectId(branch);
      }
    }

    // 3. STATUS FILTER
    if (status && status !== "all") {
        match.status = status;
    }
    
    // 4. SEARCH FILTER
    if (search) {
      match.$or = [
        { student_name: { $regex: search, $options: "i" } },
        { student_id: { $regex: search, $options: "i" } }
      ];
    }

    const students = await Student.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      
      // JOIN FEE COLLECTION
      {
        $lookup: {
          from: "fees",
          localField: "_id",
          foreignField: "student",
          as: "fee_summary"
        }
      },
      { $unwind: { path: "$fee_summary", preserveNullAndEmptyArrays: true } },
      
      // JOIN COURSE COLLECTION
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      
      // JOIN BATCH COLLECTION
      {
        $lookup: {
          from: "batches",
          localField: "batch",
          foreignField: "_id",
          as: "batch"
        }
      },
      { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },

      // JOIN BRANCH COLLECTION
      {
        $lookup: {
          from: "branches",
          localField: "branch",
          foreignField: "_id",
          as: "branch"
        }
      },
      { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } }
    ]);

    const total = await Student.countDocuments(match);
    const totalPages = Math.ceil(total / limit); // 🚀 FIXED: Added totalPages for frontend pagination

    res.status(200).json({
      success: true,
      data: students,
      pagination: { total, page, limit, totalPages } // 🚀 FIXED: Sent totalPages
    });
  } catch (error) {
    console.error("GET_ALL_STUDENTS_ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "API CRASHED", 
      exact_error: error.message
    });
  }
};

export const deleteStudent = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.photo_url) deleteLocalFile(student.photo_url);

    await Promise.all([
      Student.deleteOne({ _id: student._id }, { session }),
      fee.deleteOne({ student: student._id }, { session }),
      payment.deleteMany({ student: student._id }, { session }),
      Batch.findByIdAndUpdate(student.batch, { $pull: { students: student._id } }, { session }),
    ]);

    if (isReplicaSet) await session.commitTransaction();
    res.status(200).json({ success: true, message: "Student and all financial history deleted." });
  } catch (error) {
    if (isReplicaSet && session.inTransaction()) await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const removeStudentImage = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.photo_url) deleteLocalFile(student.photo_url);

    student.photo_url = "";
    await student.save();

    res.status(200).json({ message: "Image removed successfully", data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleStudentStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.is_active = !student.is_active;
    await student.save();

    res.status(200).json({ message: `Student ${student.is_active ? "activated" : "deactivated"} successfully`, data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publicSearchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.status(400).json({ message: "Search query is required" });

    const student = await Student.findOne({
      $or: [{ student_id: query.trim() }, { registration_number: query.trim() }],
      is_active: true,
    })
      .populate("course", "course_name course_code duration additional_info")
      .populate("batch", "batch_name batch_type time_slot schedule_days")
      .select("-__v");

    if (!student) return res.status(404).json({ message: "Student not found or not active", data: null });

    res.status(200).json({ message: "Student found", data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "course_name course_code duration description additional_info")
      .populate("batch", "batch_name batch_type time_slot schedule_days");

    if (!student || !student.is_active) return res.status(404).json({ message: "Student not found or inactive" });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") return res.status(400).json({ message: "Search query is required" });

    const students = await Student.find({
      ...req.branchFilter, 
      $or: [{ student_id: { $regex: query.trim(), $options: "i" } }, { registration_number: { $regex: query.trim(), $options: "i" } }],
    })
      .populate("course", "course_name course_code duration")
      .populate("batch", "batch_name batch_type time_slot")
      .populate({ path: "comments", populate: { path: "instructor", select: "full_name photo_url" } })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ message: "Search completed", data: students, count: students.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("course", "course_name course_code duration description additional_info")
      .populate("batch", "batch_name batch_type time_slot")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "instructor", select: "full_name photo_url designation" },
      });

    if (!student) return res.status(404).json({ message: "Student not found" });
    
    const isMaster = req.user.role?.name === "superadmin" || req.user.role?.permissions?.includes("all_access");
    if (!isMaster && student.branch.toString() !== req.user.branch.toString()) {
       return res.status(403).json({ message: "Unauthorized access to student from another branch." });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 NEW: ADD STUDENT COMMENT FUNCTION
export const addStudentComment = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Assuming your Student model has a 'comments' array
    student.comments.push({
      instructor: req.user._id, // Ensure your verifyToken middleware sets req.user
      text: text,
      createdAt: new Date()
    });

    await student.save();
    res.status(201).json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 🚀 NEW: GET STUDENT COMMENTS FUNCTION
export const fetchStudentComments = async (req, res) => {
  try {
    const { studentId } = req.params;

    // স্টুডেন্টকে খুঁজবে এবং শুধু কমেন্টগুলো আনবে (সাথে ইন্সট্রাক্টরের নাম ও ছবি)
    const student = await Student.findById(studentId)
      .select("comments")
      .populate({
        path: "comments.instructor",
        select: "full_name photo_url designation"
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // কমেন্টগুলো নতুন থেকে পুরানো হিসেবে সর্ট করা
    const sortedComments = student.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ 
      success: true, 
      data: sortedComments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};