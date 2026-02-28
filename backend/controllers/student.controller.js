import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js"; // ADDED
import Fee from "../models/fee.js";       // ADDED
import { deleteLocalFile } from "../middlewares/multer.js";
import mongoose from "mongoose";

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
    
    // 1. Fetch Course to grab the base sticker price
    const course = await Course.findById(req.body.course).session(session);
    if (!course) {
      throw new Error("Selected course not found");
    }

    if (req.file) req.body.photo_url = `/uploads/students/${req.file.filename}`;

    // 2. Create the Student
    const [student] = await Student.create([req.body], { session });

    // 3. Update Batch
    await Batch.findByIdAndUpdate(
      student.batch,
      { $push: { students: student._id } },
      { session },
    );

    // 4. Generate Financial Ledger (Master Invoice)
    const baseFee = course.base_fee || 0;
    const discount = Number(req.body.discount_amount) || 0;
    const netPayable = Math.max(0, baseFee - discount); // Prevent negative dues

    await Fee.create([{
      student: student._id,
      branch: student.branch,
      course: student.course,
      total_amount: baseFee,
      discount: discount,
      net_payable: netPayable,
      paid_amount: 0,
      status: netPayable === 0 ? "Paid" : "Unpaid" // Auto-clears if 100% scholarship
    }], { session });

    if (isReplicaSet) await session.commitTransaction();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (isReplicaSet && session.inTransaction())
      await session.abortTransaction();
    if (req.file) deleteLocalFile(req.file.path);
    res
      .status(error.code === 11000 ? 400 : 500)
      .json({ success: false, message: error.message });
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
        await Batch.findByIdAndUpdate(
          oldBatchId,
          { $pull: { students: student._id } },
          { session },
        );
      await Batch.findByIdAndUpdate(
        newBatchId,
        { $push: { students: student._id } },
        { session },
      );
    }

    if (isReplicaSet) await session.commitTransaction();
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    if (isReplicaSet && session.inTransaction())
      await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const { search, status, batch, course, branch } = req.query;

    let filter = {};
    if (req.user.role !== "admin") filter.branch = req.user.branch;
    else if (branch && branch !== "all") filter.branch = branch;

    if (search) {
      const regex = { $regex: search, $options: "i" };
      filter.$or = [
        { student_name: regex },
        { student_id: regex },
        { email: regex },
      ];
    }
    if (status && status !== "all") filter.status = status;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("course batch branch")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    res
      .status(200)
      .json({
        success: true,
        data: students,
        pagination: { total, page, limit },
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { session, isReplicaSet } = await getSessionInfo();
  try {
    if (isReplicaSet) session.startTransaction();
    
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    if (student.photo_url) deleteLocalFile(student.photo_url);
    const batchId = student.batch;
    
    await student.deleteOne({ session });
    
    if (batchId)
      await Batch.findByIdAndUpdate(batchId, {
        $pull: { students: student._id },
      }, { session });

    // Optional: Delete associated fee/payment records to clean up DB
    await Fee.deleteMany({ student: student._id }, { session });
    // await Payment.deleteMany({ student: student._id }, { session }); // Uncomment when Payment is imported

    if (isReplicaSet) await session.commitTransaction();
    res.status(200).json({ success: true, message: "Student deleted" });
  } catch (error) {
    if (isReplicaSet && session.inTransaction())
      await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
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