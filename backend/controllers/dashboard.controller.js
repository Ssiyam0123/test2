import Student from "../models/student.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import Payment from "../models/payment.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Requisition from "../models/requisition.js";
import Branch from "../models/branch.js";
import Course from "../models/course.js";
import Expense from "../models/expense.js";

export const getDashboardStats = catchAsync(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const branchFilter = req.branchFilter || {};

  const safeQuery = async (promise, defaultVal) => {
    try {
      return await promise;
    } catch (error) {
      console.error(`DB Query Error: ${error.message}`);
      return defaultVal;
    }
  };

  const instructorRole = await safeQuery(
    Role.findOne({ name: { $regex: /instructor/i } }),
    null,
  );

  const monthlyFeesPipeline = [
    {
      $match: {
        ...branchFilter,
        createdAt: { $gte: new Date(currentYear, 0, 1) },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const batchStudentsPipeline = [
    { $match: { ...branchFilter, batch: { $exists: true, $ne: null } } },
    { $group: { _id: "$batch", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "batches",
        localField: "_id",
        foreignField: "_id",
        as: "batchDoc",
      },
    },
    { $unwind: "$batchDoc" },
    { $project: { name: "$batchDoc.batch_name", count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ];

  const [
    totalStudents,
    activeStudents,
    totalBatches,
    totalInstructors,
    monthlyFeesRaw,
    batchDistribution,
    totalFeesRaw,
  ] = await Promise.all([
    safeQuery(Student.countDocuments(branchFilter), 0),
    safeQuery(Student.countDocuments({ ...branchFilter, status: "active" }), 0),
    safeQuery(Batch.countDocuments({ ...branchFilter, status: "Active" }), 0),
    safeQuery(
      User.countDocuments({
        ...branchFilter,
        role: instructorRole?._id,
        status: "Active",
      }),
      0,
    ),

    safeQuery(Payment.aggregate(monthlyFeesPipeline), []),
    safeQuery(Student.aggregate(batchStudentsPipeline), []),
    safeQuery(
      Payment.aggregate([
        { $match: branchFilter },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      [],
    ),
  ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
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
      finance: { collected: totalRevenue },
    },
    charts: {
      monthlyRevenue,
      batchDistribution,
    },
  };

  res
    .status(200)
    .json(new ApiResponse(200, responseData, "Command Center Data Loaded"));
});

// export const getBranchStats = catchAsync(async (req, res, next) => {
//   const { branchId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(branchId)) {
//     return next(new AppError("Invalid Branch ID format", 400));
//   }

//   // Security: If not master, can't view other branch stats
//   if (!req.isMaster && branchId !== req.user.branch.toString()) {
//     return next(new AppError("Unauthorized access to branch statistics", 403));
//   }

//   const branchObjectId = new mongoose.Types.ObjectId(branchId);
//   const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

//   const [stats, batchDistribution] = await Promise.all([
//     Promise.all([
//       Student.countDocuments({ branch: branchObjectId }),
//       Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
//       User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
//       Course.countDocuments({ is_active: true }),
//     ]),

//     Batch.aggregate([
//       { $match: { branch: branchObjectId } },
//       { $project: {
//           batch_name: 1,
//           student_count: { $size: { $ifNull: ["$students", []] } },
//           createdAt: 1
//       }},
//       { $sort: { createdAt: -1 } },
//       { $limit: 10 },
//     ]),
//   ]);

//   const responseData = {
//     totalStudents: stats[0],
//     activeBatches: stats[1],
//     instructors: stats[2],
//     activeCourses: stats[3],
//     chartData: batchDistribution,
//   };

//   res.status(200).json(new ApiResponse(200, responseData, "Branch statistics fetched successfully"));
// });

// export const getBranchStats = catchAsync(async (req, res, next) => {
//   const { branchId } = req.params;
//   const branchObjectId = new mongoose.Types.ObjectId(branchId);
//   const currentYear = new Date().getFullYear();

//   if (!req.isMaster && branchId !== req.user.branch.toString()) {
//     return next(new AppError("Unauthorized access", 403));
//   }

//   const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

//   const [basicStats, batchDistribution, revenueStats, pendingReqs] = await Promise.all([
//     // Basic Counts
//     Promise.all([
//       Student.countDocuments({ branch: branchObjectId }),
//       Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
//       User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
//       Course.countDocuments({ is_active: true }),
//     ]),

//     // Batch Distribution
//     Batch.aggregate([
//       { $match: { branch: branchObjectId } },
//       { $project: {
//           batch_name: 1,
//           student_count: { $size: { $ifNull: ["$students", []] } },
//           createdAt: 1
//       }},
//       { $sort: { createdAt: -1 } },
//       { $limit: 8 },
//     ]),

//     // 💰 Monthly Revenue Aggregation (Current Year)
//     Payment.aggregate([
//       {
//         $match: {
//           branch: branchObjectId,
//           createdAt: { $gte: new Date(currentYear, 0, 1) }
//         }
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           total: { $sum: "$amount" }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ]),

//     // 📦 Logistics Alert (Pending Requisitions)
//     // ধরলাম তোর রিকুইজিশন মডেলের নাম Requisition
//     mongoose.model('Requisition').countDocuments({
//       branch: branchObjectId,
//       status: 'pending'
//     })
//   ]);

//   // Format Monthly Data for Chart
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const formattedRevenue = months.map((month, index) => {
//     const found = revenueStats.find(r => r._id === index + 1);
//     return { name: month, amount: found ? found.total : 0 };
//   });

//   const responseData = {
//     totalStudents: basicStats[0],
//     activeBatches: basicStats[1],
//     instructors: basicStats[2],
//     activeCourses: basicStats[3],
//     totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.total, 0),
//     pendingRequisitions: pendingReqs,
//     chartData: batchDistribution,
//     revenueChart: formattedRevenue
//   };

//   res.status(200).json(new ApiResponse(200, responseData, "Analytics Sync Complete"));
// });

// export const getBranchStats = catchAsync(async (req, res, next) => {
//   const { branchId } = req.params;
//   const branchObjectId = new mongoose.Types.ObjectId(branchId);
//   const currentYear = new Date().getFullYear();

//   if (!req.isMaster && branchId !== req.user.branch.toString()) {
//     return next(new AppError("Unauthorized access", 403));
//   }

//   const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

//   // 🚀 Promise.all এ branchDoc অ্যাড করা হয়েছে
//   const [basicStats, batchDistribution, revenueStats, pendingReqs, branchDoc] = await Promise.all([
//     // Basic Counts
//     Promise.all([
//       Student.countDocuments({ branch: branchObjectId }),
//       Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
//       User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
//       Course.countDocuments({ is_active: true }),
//     ]),

//     // Batch Distribution
//     Batch.aggregate([
//       { $match: { branch: branchObjectId } },
//       { $project: {
//           batch_name: 1,
//           student_count: { $size: { $ifNull: ["$students", []] } },
//           createdAt: 1
//       }},
//       { $sort: { createdAt: -1 } },
//       { $limit: 8 },
//     ]),

//     // 💰 Monthly Revenue Aggregation
//     Payment.aggregate([
//       {
//         $match: {
//           branch: branchObjectId,
//           createdAt: { $gte: new Date(currentYear, 0, 1) }
//         }
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           total: { $sum: "$amount" }
//         }
//       },
//       { $sort: { "_id": 1 } }
//     ]),

//     // 📦 Logistics Alert (Pending Requisitions)
//     Requisition.countDocuments({
//       branch: branchObjectId,
//       status: 'pending'
//     }),

//     // 🏛️ Fetch Branch Info (নতুন সংযোজন)
//     Branch.findById(branchObjectId).select("branch_name")
//   ]);

//   // Format Monthly Data for Chart
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const formattedRevenue = months.map((month, index) => {
//     const found = revenueStats.find(r => r._id === index + 1);
//     return { name: month, amount: found ? found.total : 0 };
//   });

//   const responseData = {
//     branchName: branchDoc ? branchDoc.branch_name : "Unknown Branch", // 🚀 নতুন ফিল্ড
//     totalStudents: basicStats[0],
//     activeBatches: basicStats[1],
//     instructors: basicStats[2],
//     activeCourses: basicStats[3],
//     totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.total, 0),
//     pendingRequisitions: pendingReqs,
//     chartData: batchDistribution,
//     revenueChart: formattedRevenue
//   };

//   res.status(200).json(new ApiResponse(200, responseData, "Analytics Sync Complete"));
// });

// export const getBranchStats = catchAsync(async (req, res, next) => {
//   const { branchId } = req.params;
//   const branchObjectId = new mongoose.Types.ObjectId(branchId);
//   const currentYear = new Date().getFullYear();

//   if (!req.isMaster && branchId !== req.user.branch.toString()) {
//     return res.status(403).json(new ApiResponse(403, null, "Unauthorized access"));
//   }

//   const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

//   // 🚀 একযোগে সব ডেটা ফেচ করার জন্য Promise.all
//   const [
//     basicStats,
//     batchDistribution,
//     revenueStats,
//     pendingReqs,
//     branchDoc,
//     recentStudents,
//     recentPayments,
//     classExpenseBreakdown
//   ] = await Promise.all([
//     // ১. বেসিক কাউন্টস
//     Promise.all([
//       Student.countDocuments({ branch: branchObjectId }),
//       Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
//       User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
//       Course.countDocuments({ is_active: true }),
//     ]),

//     // ২. ব্যাচ অনুযায়ী স্টুডেন্ট ডিস্ট্রিবিউশন
//     Batch.aggregate([
//       { $match: { branch: branchObjectId } },
//       { $project: {
//           batch_name: 1,
//           student_count: { $size: { $ifNull: ["$students", []] } },
//           createdAt: 1
//       }},
//       { $sort: { createdAt: -1 } },
//       { $limit: 8 },
//     ]),

//     // ৩. মান্থলি রেভিনিউ গ্রোথ
//     Payment.aggregate([
//       { $match: { branch: branchObjectId, createdAt: { $gte: new Date(currentYear, 0, 1) } } },
//       { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
//       { $sort: { "_id": 1 } }
//     ]),

//     // ৪. পেন্ডিং লজিস্টিকস কাউন্ট
//     Requisition.countDocuments({ branch: branchObjectId, status: 'pending' }),

//     // ৫. ব্রাঞ্চের নাম
//     Branch.findById(branchObjectId).select("branch_name"),

//     // ৬. রিসেন্ট স্টুডেন্ট এনরোলমেন্ট (সর্বশেষ ৫ জন)
//     Student.find({ branch: branchObjectId })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("student_name student_id photo_url createdAt")
//       .lean(),

//     // ৭. রিসেন্ট পেমেন্ট ট্রানজেকশন (সর্বশেষ ৫টি)
//     Payment.find({ branch: branchObjectId })
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate("student", "student_name student_id")
//       .select("amount payment_type createdAt")
//       .lean(),

//     // ৮. ক্লাস অনুযায়ী খরচের হিসাব (Top 10 Expensive Classes)
//     Expense.aggregate([
//       { $match: { branch: branchObjectId, class_content: { $exists: true } } },
//       { $group: {
//           _id: "$class_content",
//           totalExpense: { $sum: "$amount" }
//       }},
//       { $lookup: {
//           from: "classcontents",
//           localField: "_id",
//           foreignField: "_id",
//           as: "classData"
//       }},
//       { $unwind: "$classData" },
//       { $project: {
//           topic: "$classData.topic",
//           class_number: "$classData.class_number",
//           totalExpense: 1
//       }},
//       { $sort: { totalExpense: -1 } },
//       { $limit: 10 }
//     ])
//   ]);

//   // চার্টের জন্য মান্থলি ডাটা ফরম্যাট
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const formattedRevenue = months.map((month, index) => {
//     const found = revenueStats.find(r => r._id === index + 1);
//     return { name: month, amount: found ? found.total : 0 };
//   });

//   res.status(200).json(new ApiResponse(200, {
//     branchName: branchDoc ? branchDoc.branch_name : "Unknown Campus",
//     totalStudents: basicStats[0],
//     activeBatches: basicStats[1],
//     instructors: basicStats[2],
//     activeCourses: basicStats[3],
//     totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.total, 0),
//     pendingLogistics: pendingReqs,
//     batchData: batchDistribution,
//     revenueChart: formattedRevenue,
//     recentActivities: {
//       students: recentStudents,
//       payments: recentPayments
//     },
//     classCosts: classExpenseBreakdown
//   }, "Branch Intelligence Synced"));
// });

// export const getBranchStats = catchAsync(async (req, res, next) => {
//   const { branchId } = req.params;
//   const branchObjectId = new mongoose.Types.ObjectId(branchId);
//   const currentYear = new Date().getFullYear();

//   if (!req.isMaster && branchId !== req.user.branch.toString()) {
//     return res.status(403).json(new ApiResponse(403, null, "Unauthorized access"));
//   }

//   const instructorRole = await Role.findOne({ name: { $regex: /instructor/i } });

//   const [
//     basicStats,
//     batchDistribution,
//     revenueStats,
//     pendingReqs,
//     branchDoc,
//     recentActivities,
//     // 🚀 নতুন: ক্লাস-ভিত্তিক খরচের বিস্তারিত ডাটা (ব্যাচ আইডি সহ)
//     classWiseExpenses,
//     // 🚀 নতুন: ড্রপডাউনের জন্য ব্রাঞ্চের সব ব্যাচ
//     branchBatches
//   ] = await Promise.all([
//     Promise.all([
//       Student.countDocuments({ branch: branchObjectId }),
//       Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
//       User.countDocuments({ branch: branchObjectId, role: instructorRole?._id }),
//       Course.countDocuments({ is_active: true }),
//     ]),
//     Batch.aggregate([
//       { $match: { branch: branchObjectId } },
//       { $project: { batch_name: 1, student_count: { $size: { $ifNull: ["$students", []] } }, createdAt: 1 }},
//       { $sort: { createdAt: -1 } },
//       { $limit: 8 },
//     ]),
//     Payment.aggregate([
//       { $match: { branch: branchObjectId, createdAt: { $gte: new Date(currentYear, 0, 1) } } },
//       { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
//       { $sort: { "_id": 1 } }
//     ]),
//     Requisition.countDocuments({ branch: branchObjectId, status: 'pending' }),
//     Branch.findById(branchObjectId).select("branch_name"),
//     Promise.all([
//       Student.find({ branch: branchObjectId }).sort({ createdAt: -1 }).limit(5).select("student_name student_id photo_url createdAt").lean(),
//       Payment.find({ branch: branchObjectId }).sort({ createdAt: -1 }).limit(5).populate("student", "student_name student_id").select("amount payment_type createdAt").lean()
//     ]),
//     // 📊 ক্লাস এক্সপেন্স এগ্রিগেশন
//     Expense.aggregate([
//       { $match: { branch: branchObjectId, class_content: { $exists: true } } },
//       { $group: {
//           _id: "$class_content",
//           batchId: { $first: "$batch" }, // ব্যাচ আইডি ট্রাক করার জন্য
//           totalExpense: { $sum: "$amount" }
//       }},
//       { $lookup: { from: "classcontents", localField: "_id", foreignField: "_id", as: "classData" } },
//       { $unwind: "$classData" },
//       { $project: {
//           topic: "$classData.topic",
//           class_number: "$classData.class_number",
//           batchId: 1,
//           totalExpense: 1
//       }},
//       { $sort: { class_number: 1 } }
//     ]),
//     Batch.find({ branch: branchObjectId }).select("batch_name").lean()
//   ]);

//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const formattedRevenue = months.map((month, index) => {
//     const found = revenueStats.find(r => r._id === index + 1);
//     return { name: month, amount: found ? found.total : 0 };
//   });

//   res.status(200).json(new ApiResponse(200, {
//     branchName: branchDoc?.branch_name || "Campus Analytics",
//     totalStudents: basicStats[0],
//     activeBatches: basicStats[1],
//     instructors: basicStats[2],
//     activeCourses: basicStats[3],
//     totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.total, 0),
//     pendingLogistics: pendingReqs,
//     batchDistribution,
//     revenueChart: formattedRevenue,
//     recentActivities: { students: recentActivities[0], payments: recentActivities[1] },
//     classWiseExpenses, // 🚀
//     branchBatches      // 🚀
//   }, "Branch Intelligence Synced"));
// });

export const getBranchStats = catchAsync(async (req, res, next) => {
  const { branchId } = req.params;
  const branchObjectId = new mongoose.Types.ObjectId(branchId);
  const currentYear = new Date().getFullYear();

  if (!req.isMaster && branchId !== req.user.branch.toString()) {
    return res
      .status(403)
      .json(new ApiResponse(403, null, "Unauthorized access"));
  }

  const instructorRole = await Role.findOne({
    name: { $regex: /instructor/i },
  });

  const [basicStats, revenueStats, pendingReqs, branchDoc, recentActivities] =
    await Promise.all([
      Promise.all([
        Student.countDocuments({ branch: branchObjectId }),
        Batch.countDocuments({ branch: branchObjectId, status: "Active" }),
        User.countDocuments({
          branch: branchObjectId,
          role: instructorRole?._id,
        }),
        Course.countDocuments({ is_active: true }),
      ]),

      Payment.aggregate([
        {
          $match: {
            branch: branchObjectId,
            createdAt: { $gte: new Date(currentYear, 0, 1) },
          },
        },
        {
          $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } },
        },
        { $sort: { _id: 1 } },
      ]),

      Requisition.countDocuments({ branch: branchObjectId, status: "pending" }),

      Branch.findById(branchObjectId).select("branch_name"),

      Promise.all([
        Student.find({ branch: branchObjectId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("student_name student_id photo_url createdAt")
          .lean(),
        Payment.find({ branch: branchObjectId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("student", "student_name student_id")
          .select("amount payment_type createdAt")
          .lean(),
      ]),
    ]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const formattedRevenue = months.map((month, index) => {
    const found = revenueStats.find((r) => r._id === index + 1);
    return { name: month, amount: found ? found.total : 0 };
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        branchName: branchDoc?.branch_name || "Campus Analytics",
        totalStudents: basicStats[0],
        activeBatches: basicStats[1],
        instructors: basicStats[2],
        activeCourses: basicStats[3],
        totalRevenue: revenueStats.reduce((acc, curr) => acc + curr.total, 0),
        pendingLogistics: pendingReqs,
        revenueChart: formattedRevenue,
        recentActivities: {
          students: recentActivities[0],
          payments: recentActivities[1],
        },
      },
      "Branch Intelligence Synced",
    ),
  );
});
