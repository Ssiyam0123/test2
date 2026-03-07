import Course from "../models/course.js";
import AppError from "../utils/AppError.js";

export const createCourse = async (data) => await Course.create(data);

export const modifyCourse = async (id, data) => {
  const course = await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!course) throw new AppError("Course not found", 404);
  return course;
};

export const removeCourse = async (id) => {
  const course = await Course.findByIdAndDelete(id);
  if (!course) throw new AppError("Course not found", 404);
  return course;
};

export const switchCourseStatus = async (id) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError("Course not found", 404);
  course.is_active = !course.is_active;
  await course.save();
  return course;
};

export const fetchAllCourses = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 30;
  const skip = (page - 1) * limit;
  
  let filter = {};
  if (query.search) {
    filter.$or = [
      { course_name: { $regex: query.search, $options: "i" } },
      { course_code: { $regex: query.search, $options: "i" } }
    ];
  }
  if (query.is_active !== undefined) filter.is_active = query.is_active === "true";

  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Course.countDocuments(filter)
  ]);

  return { courses, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

export const fetchActiveCourses = async () => await Course.find({ is_active: true }).sort({ course_name: 1 }).lean();

export const fetchCourseById = async (id) => {
  const course = await Course.findById(id).lean();
  if (!course) throw new AppError("Course not found", 404);
  return course;
};

export const fetchCourseStats = async () => {
  const stats = await Course.aggregate([
    { $group: { _id: "$is_active", count: { $sum: 1 }, avgDuration: { $avg: "$duration.value" } } },
    { $group: {
        _id: null,
        totalCourses: { $sum: "$count" },
        activeCourses: { $sum: { $cond: [{ $eq: ["$_id", true] }, "$count", 0] } },
        inactiveCourses: { $sum: { $cond: [{ $eq: ["$_id", false] }, "$count", 0] } },
        stats: { $push: "$$ROOT" }
      }
    }
  ]);
  return stats[0] || { totalCourses: 0, activeCourses: 0, inactiveCourses: 0, stats: [] };
};