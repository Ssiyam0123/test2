import mongoose from "mongoose";
import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import Expense from "../models/expense.js";
import { addDays, format, startOfDay } from "date-fns";
import AppError from "../utils/AppError.js";

// Transaction Helper
const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const fetchBatchClasses = async (batchId, branchFilter) => {
  const batchExists = await Batch.exists({ _id: batchId, ...branchFilter });
  if (!batchExists) throw new AppError("Batch not found or unauthorized.", 404);

  return await ClassContent.find({ batch: batchId }).sort({ class_number: 1 });
};

export const insertClassesToSyllabus = async (batchId, classesData, branchFilter) => {
  return await executeTransaction(async (session) => {
    const batch = await Batch.findOne({ _id: batchId, ...branchFilter }).session(session);
    if (!batch) throw new AppError("Batch not found or unauthorized.", 404);

    const classArray = Array.isArray(classesData) ? classesData : [classesData];
    
    const formattedClasses = classArray.map((cls) => ({
      batch: batchId,
      branch: batch.branch,
      topic: cls.topic,
      class_number: cls.order_index || cls.class_number, 
      class_type: cls.class_type || "Lecture",
      content_details: cls.description ? [cls.description] : [], 
      date_scheduled: null,
      is_completed: false
    }));

    const newClasses = await ClassContent.insertMany(formattedClasses, { session });
    const newIds = newClasses.map((c) => c._id);

    await Batch.findByIdAndUpdate(batchId, {
      $push: { class_contents: { $each: newIds } }
    }, { session });

    return newClasses;
  });
};

export const modifyClassContent = async (classId, updateData, branchFilter) => {
  if (updateData.content_details && typeof updateData.content_details === "string") {
    updateData.content_details = updateData.content_details.split("\n").filter((i) => i.trim());
  }

  const updated = await ClassContent.findOneAndUpdate(
    { _id: classId, ...branchFilter },
    updateData,
    { new: true }
  );
  
  if (!updated) throw new AppError("Class not found or unauthorized.", 404);
  return updated;
};

export const removeClassContent = async (classId, branchFilter) => {
  await executeTransaction(async (session) => {
    const classToDelete = await ClassContent.findOne({ _id: classId, ...branchFilter }).session(session);
    if (!classToDelete) throw new AppError("Class not found or unauthorized.", 404);

    await Batch.findByIdAndUpdate(classToDelete.batch, { $pull: { class_contents: classId } }, { session });
    await ClassContent.findByIdAndDelete(classId).session(session);
  });
};

export const assignClassDate = async (classId, dateScheduled, branchFilter) => {
  const updatedClass = await ClassContent.findOneAndUpdate(
    { _id: classId, ...branchFilter },
    { date_scheduled: dateScheduled },
    { new: true }
  );

  if (!updatedClass) throw new AppError("Class not found or unauthorized.", 404);
  return updatedClass;
};

export const recordClassAttendance = async (classId, data, branchFilter, userId) => {
  return await executeTransaction(async (session) => {
    const { attendanceRecords, instructorId, is_completed, financials } = data;

    const classRecord = await ClassContent.findOne({ _id: classId, ...branchFilter }).populate("batch").session(session);
    if (!classRecord) throw new AppError("Class not found or unauthorized.", 404);

    const updatedClass = await ClassContent.findByIdAndUpdate(
      classId,
      {
        attendance: attendanceRecords,
        instructor: instructorId || classRecord.instructor,
        is_completed: is_completed ?? true,
        ...(financials && { financials }),
      },
      { new: true, session }
    ).populate("attendance.student", "student_name student_id");

    if (financials?.actual_cost > 0) {
      await Expense.findOneAndUpdate(
        { class_content: classId },
        {
          amount: financials.actual_cost,
          title: financials.expense_notes || `Class ${classRecord.class_number} Expense`,
          batch: classRecord.batch._id,
          branch: classRecord.batch.branch,
          recorded_by: userId,
        },
        { upsert: true, session }
      );
    }

    return updatedClass;
  });
};


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

export const generateAutoSchedule = async (batchId, branchFilter) => {
  return await executeTransaction(async (session) => {
    const batch = await Batch.findOne({ _id: batchId, ...branchFilter }).session(session);

    if (!batch || !batch.start_date || !batch.schedule_days?.length) {
      throw new AppError("Batch missing configuration (Start Date/Schedule Days)", 400);
    }

    const classes = await ClassContent.find({ batch: batchId }).sort({ class_number: 1 }).session(session);
    if (classes.length === 0) throw new AppError("Syllabus is empty.", 400);

    let currentCheckDate = startOfDay(new Date(batch.start_date));
    const updates = [];

    for (const cls of classes) {
      let dateFound = false;
      while (!dateFound) {
        const dayName = format(currentCheckDate, "EEEE");
        if (batch.schedule_days.includes(dayName) && !isHoliday(currentCheckDate)) {
          updates.push({
            updateOne: {
              filter: { _id: cls._id },
              update: { date_scheduled: new Date(currentCheckDate) }
            }
          });
          dateFound = true;
        }
        currentCheckDate = addDays(currentCheckDate, 1);
      }
    }

    // 🚀 BulkWrite is 10x faster than Promise.all() for multiple document updates
    if (updates.length > 0) {
      await ClassContent.bulkWrite(updates, { session });
    }
  });
};