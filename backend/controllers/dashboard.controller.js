import Student from "../models/student.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";
import ClassContent from "../models/classContent.js";
import Comment from "../models/comment.js";
import Role from "../models/role.js"; // 🚀 IMPORTED ROLE MODEL
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // 🚀 1. Fetch the Instructor Role ObjectId before querying
    const instructorRole = await Role.findOne({ name: "instructor" });

    const [
      totalStudents, activeStudents, completedStudents,
      totalCourses, activeCourses, totalBatches, activeBatches,
      totalInstructors, monthlyRegistrations, courseDistribution,
      statusDistribution, genderDistribution, competencyDistribution,
      batchDistribution, attendanceHealth, recentActivities, recentComments
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ is_active: true, status: { $in: ["active", "on_leave"] } }),
      Student.countDocuments({ status: "completed" }),
      
      Course.countDocuments(),
      Course.countDocuments({ is_active: true }),
      Batch.countDocuments(),
      Batch.countDocuments({ status: "Active" }),

      // 🚀 PBAC FIX: Using instructorRole._id
      User.countDocuments({ role: instructorRole?._id, status: "Active" }),

      Student.aggregate([
        { $match: { issue_date: { $gte: new Date(currentYear, 0, 1), $lte: new Date(currentYear, 11, 31, 23, 59, 59) } } },
        { $group: { _id: { $month: "$issue_date" }, students: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      Student.aggregate([
        { $match: { course: { $exists: true, $ne: null } } },
        { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "courseDoc" } },
        { $unwind: "$courseDoc" },
        { $group: { _id: "$courseDoc.course_name", students: { $sum: 1 } } },
        { $sort: { students: -1 } },
        { $limit: 5 },
      ]),
      
      Student.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Student.aggregate([{ $match: { gender: { $exists: true, $ne: null } } }, { $group: { _id: "$gender", count: { $sum: 1 } } }]),
      Student.aggregate([{ $group: { _id: "$competency", count: { $sum: 1 } } }]),
      
      Student.aggregate([
        { $match: { batch: { $exists: true, $ne: null } } },
        { $group: { _id: "$batch", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batchDoc" } },
        { $unwind: "$batchDoc" },
        { $project: { batchName: "$batchDoc.batch_name", count: 1, _id: 0 } }
      ]),

      ClassContent.aggregate([
        { $unwind: "$attendance" },
        { $group: { _id: "$attendance.status", count: { $sum: 1 } } }
      ]),
      
      Student.find().select("student_name student_id status gender createdAt photo_url").sort({ createdAt: -1 }).limit(8).lean(),
      Comment.find().populate("instructor", "full_name photo_url").populate("student", "student_name student_id").sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((month, index) => {
      const found = monthlyRegistrations.find((m) => m._id === index + 1);
      return { month: month, students: found ? found.students : 0 };
    });

    const attendanceSummary = { present: 0, absent: 0 };
    attendanceHealth.forEach(record => {
      if (record._id === 'present') attendanceSummary.present = record.count;
      if (record._id === 'absent') attendanceSummary.absent = record.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          students: { total: totalStudents, active: activeStudents, completed: completedStudents },
          courses: { total: totalCourses, active: activeCourses },
          batches: { total: totalBatches, active: activeBatches },
          staff: { instructors: totalInstructors }
        },
        charts: { monthlyData, courseDistribution, statusDistribution, genderDistribution, competencyDistribution, batchDistribution, attendanceSummary },
        feeds: { recentActivities, recentComments }
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Error fetching dashboard statistics", error: error.message });
  }
};

export const getBranchStats = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Validation: Ensure the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ success: false, message: "Invalid Branch ID format" });
    }

    const branchObjectId = new mongoose.Types.ObjectId(branchId);
    
    // Fetch the Instructor Role to count staff correctly
    const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

    const [stats, batchDistribution] = await Promise.all([
      Promise.all([
        Student.countDocuments({ branch: branchObjectId }),
        Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
        User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
        Course.countDocuments({ is_active: true }), 
      ]),

      // Aggregate batches for this specific branch
      Batch.aggregate([
        { $match: { branch: branchObjectId } },
        { $project: { 
            batch_name: 1, 
            student_count: { $size: { $ifNull: ["$students", []] } }, 
            createdAt: 1 
        }},
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents: stats[0],
        activeBatches: stats[1],
        instructors: stats[2],
        activeCourses: stats[3],
        chartData: batchDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};