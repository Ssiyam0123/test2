import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import Expense from "../models/expense.js"; 
import { addDays, format, startOfDay } from "date-fns";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ==========================================
// 🐳 [Controller: getBatchClasses]
// ==========================================
export const getBatchClasses = catchAsync(async (req, res, next) => {
  const batchExists = await Batch.exists({ _id: req.params.batchId, ...req.branchFilter });
  if (!batchExists) return next(new AppError("Batch not found or unauthorized.", 404));

  const classes = await ClassContent.find({ batch: req.params.batchId }).sort({ class_number: 1 });
  res.status(200).json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

// ==========================================
// 🐳 [Controller: addClassToSyllabus]
// ==========================================
export const addClassToSyllabus = catchAsync(async (req, res, next) => {
  const { batchId } = req.params;
  const classesData = Array.isArray(req.body) ? req.body : [req.body];

  const batch = await Batch.findOne({ _id: batchId, ...req.branchFilter });
  if (!batch) return next(new AppError("Batch not found or unauthorized.", 404));

  const formattedClasses = classesData.map((cls) => ({
    batch: batchId,
    branch: batch.branch, // Carry branch for easier filtering
    topic: cls.topic,
    class_number: cls.order_index || cls.class_number, 
    class_type: cls.class_type || "Lecture",
    content_details: cls.description ? [cls.description] : [], 
    date_scheduled: null,
    is_completed: false
  }));

  const newClasses = await ClassContent.insertMany(formattedClasses);
  const newIds = newClasses.map((c) => c._id);

  await Batch.findByIdAndUpdate(batchId, {
    $push: { class_contents: { $each: newIds } },
  });

  res.status(201).json(new ApiResponse(201, newClasses, `${newClasses.length} classes added`));
});

// ==========================================
// 🐳 [Controller: updateClassContent]
// ==========================================
export const updateClassContent = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const updateData = { ...req.body };

  if (updateData.content_details && typeof updateData.content_details === "string") {
    updateData.content_details = updateData.content_details.split("\n").filter((i) => i.trim());
  }

  // Security: findOneAndUpdate with branchFilter ensures no cross-branch edits
  const updated = await ClassContent.findOneAndUpdate(
    { _id: classId, ...req.branchFilter },
    updateData,
    { new: true }
  );
  
  if (!updated) return next(new AppError("Class not found or unauthorized.", 404));

  res.status(200).json(new ApiResponse(200, updated, "Class updated successfully"));
});

// ==========================================
// 🐳 [Controller: deleteClassContent]
// ==========================================
export const deleteClassContent = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const classToDelete = await ClassContent.findOne({ _id: classId, ...req.branchFilter });
  
  if (!classToDelete) return next(new AppError("Class not found or unauthorized.", 404));

  await Batch.findByIdAndUpdate(classToDelete.batch, { $pull: { class_contents: classId } });
  await ClassContent.findByIdAndDelete(classId);
  
  res.status(200).json(new ApiResponse(200, null, "Class deleted successfully"));
});

// ==========================================
// 🐳 [Controller: scheduleClass]
// ==========================================
export const scheduleClass = catchAsync(async (req, res, next) => {
  const { classContentId } = req.params;
  const { date_scheduled } = req.body;

  const updatedClass = await ClassContent.findOneAndUpdate(
    { _id: classContentId, ...req.branchFilter },
    { date_scheduled },
    { new: true },
  );

  if (!updatedClass) return next(new AppError("Class not found or unauthorized.", 404));

  res.status(200).json(new ApiResponse(200, updatedClass, "Class scheduled"));
});

// ==========================================
// 🐳 [Controller: updateClassAttendance]
// ==========================================
export const updateClassAttendance = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const { attendanceRecords, instructorId, is_completed, financials } = req.body;

  const classRecord = await ClassContent.findOne({ _id: classId, ...req.branchFilter }).populate("batch");
  if (!classRecord) return next(new AppError("Class not found or unauthorized.", 404));

  const updatedClass = await ClassContent.findByIdAndUpdate(
    classId,
    {
      attendance: attendanceRecords,
      instructor: instructorId || classRecord.instructor,
      is_completed: is_completed ?? true,
      ...(financials && { financials }),
    },
    { new: true },
  ).populate("attendance.student", "student_name student_id");

  if (financials?.actual_cost > 0) {
    await Expense.findOneAndUpdate(
      { class_content: classId },
      {
        amount: financials.actual_cost,
        title: financials.expense_notes || `Class ${classRecord.class_number} Expense`,
        batch: classRecord.batch._id,
        branch: classRecord.batch.branch,
        recorded_by: req.user._id,
      },
      { upsert: true },
    );
  }

  res.status(200).json(new ApiResponse(200, updatedClass, "Attendance and costs updated"));
});

// ==========================================
// 🐳 [Controller: autoScheduleSyllabus]
// ==========================================
const bdHolidays = [
  "02-21", "03-17", "03-26", "04-14", "05-01", "08-15", "12-16", "12-25",
  "2026-03-03", "2026-03-20", "2026-03-21", "2026-03-22", "2026-05-27", 
  "2026-05-28", "2026-05-29", "2026-06-26", "2026-10-21",
];

const isHoliday = (dateToCheck) => {
  const monthDay = format(dateToCheck, "MM-dd");
  const fullDate = format(dateToCheck, "yyyy-MM-dd");
  return bdHolidays.includes(monthDay) || bdHolidays.includes(fullDate);
};

export const autoScheduleSyllabus = catchAsync(async (req, res, next) => {
  const { batchId } = req.params;
  const batch = await Batch.findOne({ _id: batchId, ...req.branchFilter });

  if (!batch || !batch.start_date || !batch.schedule_days?.length) {
    return next(new AppError("Batch missing configuration (Start Date/Schedule Days)", 400));
  }

  const classes = await ClassContent.find({ batch: batchId }).sort({ class_number: 1 });
  if (classes.length === 0) return next(new AppError("Syllabus is empty.", 400));

  let currentCheckDate = startOfDay(new Date(batch.start_date));
  const updates = [];

  for (const cls of classes) {
    let dateFound = false;
    while (!dateFound) {
      const dayName = format(currentCheckDate, "EEEE");
      if (batch.schedule_days.includes(dayName) && !isHoliday(currentCheckDate)) {
        updates.push(ClassContent.findByIdAndUpdate(cls._id, { date_scheduled: new Date(currentCheckDate) }));
        dateFound = true;
      }
      currentCheckDate = addDays(currentCheckDate, 1);
    }
  }

  await Promise.all(updates);
  res.status(200).json(new ApiResponse(200, null, "Calendar generated successfully"));
});