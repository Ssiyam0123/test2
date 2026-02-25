import Student from "../models/student.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import User from "../models/user.js";
import ClassContent from "../models/classContent.js";
import Comment from "../models/comment.js";

export const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Execute all database queries concurrently for maximum performance
    const [
      // 1. Student Totals
      totalStudents,
      activeStudents,
      completedStudents,
      
      // 2. Course & Batch Totals
      totalCourses,
      activeCourses,
      totalBatches,
      activeBatches,
      
      // 3. Staff Totals
      totalInstructors,

      // 4. Monthly Registrations (Line Chart)
      monthlyRegistrations,
      
      // 5. Course Distribution (Pie/Bar Chart)
      courseDistribution,
      
      // 6. Demographics & Status
      statusDistribution,
      genderDistribution, 
      competencyDistribution,

      // 7. Batch Distribution with Lookup (Top 5 populated batches)
      batchDistribution,
      
      // 8. Overall Attendance Health
      attendanceHealth,

      // 9. Feeds (Recent Data)
      recentActivities,
      recentComments
    ] = await Promise.all([
      // 1. Students
      Student.countDocuments(),
      Student.countDocuments({ is_active: true, status: { $in: ["active", "on_leave"] } }),
      Student.countDocuments({ status: "completed" }),
      
      // 2. Courses & Batches
      Course.countDocuments(),
      Course.countDocuments({ is_active: true }),
      Batch.countDocuments(),
      Batch.countDocuments({ status: "Active" }),

      // 3. Staff
      User.countDocuments({ role: "instructor", status: "Active" }),

      // 4. Monthly Registrations
      Student.aggregate([
        {
          $match: {
            issue_date: {
              $gte: new Date(currentYear, 0, 1),
              $lte: new Date(currentYear, 11, 31, 23, 59, 59),
            },
          },
        },
        { $group: { _id: { $month: "$issue_date" }, students: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // 5. Course Distribution (Relies on denormalized course_name)
      Student.aggregate([
        { $match: { course: { $exists: true, $ne: null } } },
        { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "courseDoc" } },
        { $unwind: "$courseDoc" },
        { $group: { _id: "$courseDoc.course_name", students: { $sum: 1 } } },
        { $sort: { students: -1 } },
        { $limit: 5 },
      ]),
      
      // 6. Demographics
      Student.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Student.aggregate([
        { $match: { gender: { $exists: true, $ne: null } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]),
      Student.aggregate([{ $group: { _id: "$competency", count: { $sum: 1 } } }]),
      
      // 7. Batch Distribution (Crucial Fix: Lookup batch name instead of sending ID)
      Student.aggregate([
        { $match: { batch: { $exists: true, $ne: null } } },
        { $group: { _id: "$batch", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "batches", localField: "_id", foreignField: "_id", as: "batchDoc" } },
        { $unwind: "$batchDoc" },
        { $project: { batchName: "$batchDoc.batch_name", count: 1, _id: 0 } }
      ]),

      // 8. Overall Attendance Health (Unwinds the array and counts present vs absent)
      ClassContent.aggregate([
        { $unwind: "$attendance" },
        { $group: { _id: "$attendance.status", count: { $sum: 1 } } }
      ]),
      
      // 9. Recent Feeds
      Student.find()
        .select("student_name student_id status gender createdAt photo_url")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
        
      Comment.find()
        .populate("instructor", "full_name photo_url")
        .populate("student", "student_name student_id")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Format monthly data for charts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((month, index) => {
      const found = monthlyRegistrations.find((m) => m._id === index + 1);
      return { month: month, students: found ? found.students : 0 };
    });

    // Format attendance health into a cleaner object
    const attendanceSummary = { present: 0, absent: 0 };
    attendanceHealth.forEach(record => {
      if (record._id === 'present') attendanceSummary.present = record.count;
      if (record._id === 'absent') attendanceSummary.absent = record.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totals: {
          students: {
            total: totalStudents,
            active: activeStudents,
            completed: completedStudents,
          },
          courses: {
            total: totalCourses,
            active: activeCourses,
          },
          batches: {
            total: totalBatches,
            active: activeBatches,
          },
          staff: {
            instructors: totalInstructors,
          }
        },
        charts: {
          monthlyData,
          courseDistribution,
          statusDistribution,
          genderDistribution, 
          competencyDistribution,
          batchDistribution,
          attendanceSummary 
        },
        feeds: {
          recentActivities,
          recentComments
        }
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};