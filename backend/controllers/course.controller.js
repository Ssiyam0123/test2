import Course from "../models/course.js";

// Get all courses with pagination
export const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Get query parameters for filtering
    const { search, is_active } = req.query;

    // Build filter object
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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active courses only
export const getActiveCourses = async (req, res) => {
  try {
    const courses = await Course.find({ is_active: true }).sort({
      course_name: 1,
    });

    res.status(200).json({
      data: courses,
      count: courses.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const {
      course_name,
      course_code,
      description,
      is_active,
      duration_value,
      additional_info,
      duration_unit,
    } = req.body;

    // console.log(course_name)

    // Check if course with same name or code already exists
    const existingCourse = await Course.findOne({
      $or: [{ course_name }, { course_code }],
    });

    if (existingCourse) {
      if (existingCourse.course_name === course_name) {
        return res.status(400).json({ message: "Course name already exists" });
      }
      if (existingCourse.course_code === course_code) {
        return res.status(400).json({ message: "Course code already exists" });
      }
    }

    // Create new course
    const course = await Course.create({
      course_name,
      course_code,
      description: description || "",
      is_active: is_active !== undefined ? is_active : true,
      duration: {
        value: Number(duration_value),
        unit: duration_unit || "months",
      },
      additional_info: additional_info || "",
    });

    res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Course name or code already exists",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const {
      course_name,
      course_code,
      description,

      is_active,
      duration_value,
      additional_info,
      duration_unit,
    } = req.body;

    // Check for duplicates (excluding current course)
    if (course_name || course_code) {
      const existingCourse = await Course.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(course_name ? [{ course_name }] : []),
          ...(course_code ? [{ course_code }] : []),
        ],
      });

      if (existingCourse) {
        if (existingCourse.course_name === course_name) {
          return res
            .status(400)
            .json({ message: "Course name already exists" });
        }
        if (existingCourse.course_code === course_code) {
          return res
            .status(400)
            .json({ message: "Course code already exists" });
        }
      }
    }

    // Update course data
    const updateData = {};

    if (course_name !== undefined) updateData.course_name = course_name;
    if (course_code !== undefined) updateData.course_code = course_code;
    if (description !== undefined) updateData.description = description;

    if (is_active !== undefined) updateData.is_active = is_active;
    if (additional_info !== undefined)
      updateData.additional_info = additional_info;

    // Update duration if provided
    if (duration_value !== undefined || duration_unit !== undefined) {
      updateData.duration = {
        value:
          duration_value !== undefined
            ? Number(duration_value)
            : course.duration.value,
        unit: duration_unit || course.duration.unit,
      };
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Course name or code already exists",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete course permanently
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();

    res.status(200).json({
      message: "Course deleted permanently",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle course status
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
          activeCourses: {
            $sum: {
              $cond: [{ $eq: ["$_id", true] }, "$count", 0],
            },
          },
          inactiveCourses: {
            $sum: {
              $cond: [{ $eq: ["$_id", false] }, "$count", 0],
            },
          },
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

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get course stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course statistics",
      error: error.message,
    });
  }
};
