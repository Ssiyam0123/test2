import Student from "../models/student.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";
import ClassContent from "../models/classContent.js";
import Comment from "../models/comment.js";
import Role from "../models/role.js"; 
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: getDashboardStats]
// ==========================================
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  
  // 🚀 Branch Filter logic from middleware
  const branchFilter = req.branchFilter || {};

  // 1. Fetch Instructor Role
  const instructorRole = await Role.findOne({ name: "instructor" });

  const [
    totalStudents, activeStudents, completedStudents,
    totalCourses, activeCourses, totalBatches, activeBatches,
    totalInstructors, monthlyRegistrations, courseDistribution,
    statusDistribution, genderDistribution, competencyDistribution,
    batchDistribution, attendanceHealth, recentActivities, recentComments
  ] = await Promise.all([
    Student.countDocuments(branchFilter),
    Student.countDocuments({ ...branchFilter, is_active: true, status: { $in: ["active", "on_leave"] } }),
    Student.countDocuments({ ...branchFilter, status: "completed" }),
    
    Course.countDocuments(), // Courses are usually global
    Course.countDocuments({ is_active: true }),
    Batch.countDocuments(branchFilter),
    Batch.countDocuments({ ...branchFilter, status: "Active" }),

    User.countDocuments({ ...branchFilter, role: instructorRole?._id, status: "Active" }),

    Student.aggregate([
      { $match: { ...branchFilter, issue_date: { $gte: new Date(currentYear, 0, 1), $lte: new Date(currentYear, 11, 31, 23, 59, 59) } } },
      { $group: { _id: { $month: "$issue_date" }, students: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    Student.aggregate([
      { $match: { ...branchFilter, course: { $exists: true, $ne: null } } },
      { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "courseDoc" } },
      { $unwind: "$courseDoc" },
      { $group: { _id: "$courseDoc.course_name", students: { $sum: 1 } } },
      { $sort: { students: -1 } },
      { $limit: 5 },
    ]),
    
    Student.aggregate([{ $match: branchFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Student.aggregate([{ $match: { ...branchFilter, gender: { $exists: true, $ne: null } } }, { $group: { _id: "$gender", count: { $sum: 1 } } }]),
    Student.aggregate([{ $match: branchFilter }, { $group: { _id: "$competency", count: { $sum: 1 } } }]),
    
    Student.aggregate([
      { $match: { ...branchFilter, batch: { $exists: true, $ne: null } } },
      { $group: { _id: "$batch", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batchDoc" } },
      { $unwind: "$batchDoc" },
      { $project: { batchName: "$batchDoc.batch_name", count: 1, _id: 0 } }
    ]),

    ClassContent.aggregate([
      { $match: branchFilter },
      { $unwind: "$attendance" },
      { $group: { _id: "$attendance.status", count: { $sum: 1 } } }
    ]),
    
    Student.find(branchFilter).select("student_name student_id status gender createdAt photo_url").sort({ createdAt: -1 }).limit(8).lean(),
    Comment.find(branchFilter).populate("instructor", "full_name photo_url").populate("student", "student_name student_id").sort({ createdAt: -1 }).limit(5).lean()
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((month, index) => {
    const found = monthlyRegistrations.find((m) => m._id === index + 1);
    return { month, students: found ? found.students : 0 };
  });

  const attendanceSummary = { present: 0, absent: 0 };
  attendanceHealth.forEach(record => {
    if (record._id === 'present') attendanceSummary.present = record.count;
    if (record._id === 'absent') attendanceSummary.absent = record.count;
  });

  const responseData = {
    totals: {
      students: { total: totalStudents, active: activeStudents, completed: completedStudents },
      courses: { total: totalCourses, active: activeCourses },
      batches: { total: totalBatches, active: activeBatches },
      staff: { instructors: totalInstructors }
    },
    charts: { monthlyData, courseDistribution, statusDistribution, genderDistribution, competencyDistribution, batchDistribution, attendanceSummary },
    feeds: { recentActivities, recentComments }
  };

  res.status(200).json(new ApiResponse(200, responseData, "Dashboard statistics fetched successfully"));
});

// ==========================================
// 🐳 [Controller: getBranchStats]
// ==========================================
export const getBranchStats = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    return next(new AppError("Invalid Branch ID format", 400));
  }

  // Security: If not master, can't view other branch stats
  if (!req.isMaster && branchId !== req.user.branch.toString()) {
    return next(new AppError("Unauthorized access to branch statistics", 403));
  }

  const branchObjectId = new mongoose.Types.ObjectId(branchId);
  const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

  const [stats, batchDistribution] = await Promise.all([
    Promise.all([
      Student.countDocuments({ branch: branchObjectId }),
      Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
      User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
      Course.countDocuments({ is_active: true }), 
    ]),

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

  const responseData = {
    totalStudents: stats[0],
    activeBatches: stats[1],
    instructors: stats[2],
    activeCourses: stats[3],
    chartData: batchDistribution,
  };

  res.status(200).json(new ApiResponse(200, responseData, "Branch statistics fetched successfully"));
});