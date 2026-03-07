import Student from "../models/student.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";
import Role from "../models/role.js"; 
import Payment from "../models/payment.js"; // 🚀 Revenue from Payments
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

import Course from "../models/course.js"

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const branchFilter = req.branchFilter || {}; 

  // 🛡️ Bulletproof DB Query Wrapper (Prevents 500 Errors)
  const safeQuery = async (promise, defaultVal) => {
    try { return await promise; } 
    catch (error) { 
      console.error(`DB Query Error: ${error.message}`); 
      return defaultVal; 
    }
  };

  const instructorRole = await safeQuery(Role.findOne({ name: { $regex: /instructor/i } }), null);

  // 📊 PIPELINES
  const monthlyFeesPipeline = [
    { $match: { ...branchFilter, createdAt: { $gte: new Date(currentYear, 0, 1) } } },
    { $group: { _id: { $month: "$createdAt" }, totalRevenue: { $sum: "$amount" } } },
    { $sort: { _id: 1 } }
  ];

  const batchStudentsPipeline = [
    { $match: { ...branchFilter, batch: { $exists: true, $ne: null } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batchDoc" } },
    { $unwind: "$batchDoc" },
    { $project: { name: "$batchDoc.batch_name", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: 15 } // Show top 15 batches
  ];

  // 🚀 Execute all queries in parallel safely
  const [
    totalStudents, activeStudents, totalBatches, totalInstructors,
    monthlyFeesRaw, batchDistribution, totalFeesRaw
  ] = await Promise.all([
    safeQuery(Student.countDocuments(branchFilter), 0),
    safeQuery(Student.countDocuments({ ...branchFilter, status: "active" }), 0),
    safeQuery(Batch.countDocuments({ ...branchFilter, status: "Active" }), 0),
    safeQuery(User.countDocuments({ ...branchFilter, role: instructorRole?._id, status: "Active" }), 0),

    safeQuery(Payment.aggregate(monthlyFeesPipeline), []),
    safeQuery(Student.aggregate(batchStudentsPipeline), []),
    safeQuery(Payment.aggregate([{ $match: branchFilter }, { $group: { _id: null, total: { $sum: "$amount" } } }]), [])
  ]);

  // 📅 Format Monthly Revenue Data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenue = months.map((month, index) => {
    const found = monthlyFeesRaw.find((m) => m._id === index + 1);
    return { month, revenue: found ? found.totalRevenue : 0 };
  });

  const totalRevenue = totalFeesRaw.length > 0 ? totalFeesRaw[0].total : 0;

  const responseData = {
    totals: {
      students: { total: totalStudents, active: activeStudents },
      batches: { active: totalBatches },
      staff: { instructors: totalInstructors },
      finance: { collected: totalRevenue }
    },
    charts: {
      monthlyRevenue,
      batchDistribution
    }
  };

  res.status(200).json(new ApiResponse(200, responseData, "Command Center Data Loaded"));
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