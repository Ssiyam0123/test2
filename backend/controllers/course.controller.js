import Course from "../models/course.js";

// ==========================================
// CORE CRUD OPERATIONS
// ==========================================

export const createCourse = async (req, res) => {
  try {
    // req.body is completely formatted by processCoursePayload
    const course = await Course.create(req.body);

    res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    // req.body is completely formatted by processCoursePayload
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.is_active = !course.is_active;
    await course.save();

    res.status(200).json({
      message: `Course ${course.is_active ? "activated" : "deactivated"} successfully`,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// FETCH & UTILITY OPERATIONS
// ==========================================

export const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const { search, is_active } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { course_name: { $regex: search, $options: "i" } },
        { course_code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      data: courses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_active: true }).sort({ course_name: 1 });
    res.status(200).json({ data: courses, count: courses.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      {
        $group: {
          _id: "$is_active",
          count: { $sum: 1 },
          avgDuration: { $avg: "$duration.value" },
        },
      },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: "$count" },
          activeCourses: { $sum: { $cond: [{ $eq: ["$_id", true] }, "$count", 0] } },
          inactiveCourses: { $sum: { $cond: [{ $eq: ["$_id", false] }, "$count", 0] } },
          stats: { $push: "$$ROOT" },
        },
      },
    ]);

    const result = stats[0] || {
      totalCourses: 0,
      activeCourses: 0,
      inactiveCourses: 0,
      stats: [],
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching course statistics", error: error.message });
  }
};