import mongoose from "mongoose";
import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import Expense from "../models/expense.js";
import Holiday from "../models/holiday.js"; 
import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz"; // 🚀 For Exact Bangladeshi Timezone
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

export const createBatch = async (data, isMaster, userBranch) => {
  if (!isMaster) data.branch = userBranch;
  return await Batch.create(data);
};

// 🚀 FIXED: Added Pagination for Production Scalability
export const fetchAllBatches = async (query, branchFilter, isMaster) => {
  let filter = { ...branchFilter };
  if (isMaster && query.branch && query.branch !== "all") filter.branch = query.branch;
  if (query.status && query.status !== "all") filter.status = query.status;

  // Pagination Logic
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20; // Default 20 items per page
  const skip = (page - 1) * limit;

  const totalBatches = await Batch.countDocuments(filter);

  const batches = await Batch.find(filter)
    .populate("course", "course_name")
    .populate("branch", "branch_name branch_code")
    .populate("students", "student_name student_id photo_url")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data: batches,
    pagination: {
      total: totalBatches,
      page,
      limit,
      totalPages: Math.ceil(totalBatches / limit)
    }
  };
};

export const fetchBatchById = async (id, branchFilter) => {
  const batch = await Batch.findOne({ _id: id, ...branchFilter })
    .populate("course")
    .populate("instructors", "full_name email photo_url")
    .populate("branch", "branch_name branch_code")
    .populate("students", "student_name student_id photo_url")
    .lean();
  
  if (!batch) throw new AppError("Batch not found or unauthorized.", 404);
  return batch;
};

export const modifyBatch = async (id, data, branchFilter) => {
  const updatedBatch = await Batch.findOneAndUpdate({ _id: id, ...branchFilter }, data, { new: true, runValidators: true })
    .populate("course", "course_name");
  
  if (!updatedBatch) throw new AppError("Batch not found or unauthorized.", 404);
  return updatedBatch;
};

// 🚀 FIXED: Wrapped in Transaction to avoid Data Inconsistency
export const removeBatch = async (id, branchFilter) => {
  await executeTransaction(async (session) => {
    const batch = await Batch.findOne({ _id: id, ...branchFilter }).session(session).lean();
    if (!batch) throw new AppError("Batch not found or unauthorized.", 404);

    await ClassContent.deleteMany({ batch: id }).session(session);
    await Batch.findByIdAndDelete(id).session(session);
  });
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

// 🚀 FIXED: Auto Scheduler with Infinite Loop Guard, TZ & Dynamic Holidays
export const generateAutoSchedule = async (batchId, branchFilter) => {
  return await executeTransaction(async (session) => {
    const batch = await Batch.findOne({ _id: batchId, ...branchFilter }).session(session);

    if (!batch || !batch.start_date || !batch.schedule_days?.length) {
      throw new AppError("Batch missing configuration (Start Date/Schedule Days)", 400);
    }

    const classes = await ClassContent.find({ batch: batchId }).sort({ class_number: 1 }).session(session);
    if (classes.length === 0) throw new AppError("Syllabus is empty.", 400);

    // 🚀 Dynamic Holiday Fetching (with graceful fallback if model doesn't exist yet)
    let holidayList = [];
    try {
       const dbHolidays = await Holiday.find({ is_active: true }).lean().session(session);
       // Assuming your holiday model has a 'date_string' field like "yyyy-MM-dd" or "MM-dd"
       holidayList = dbHolidays.map(h => h.date_string); 
    } catch(e) {
       holidayList = ["02-21", "03-17", "03-26", "04-14", "05-01", "08-15", "12-16", "12-25"];
    }

    const isHoliday = (dateToCheck) => {
      // 🚀 Explicit Timezone calculation for DB dates
      const monthDay = formatInTimeZone(dateToCheck, "Asia/Dhaka", "MM-dd");
      const fullDate = formatInTimeZone(dateToCheck, "Asia/Dhaka", "yyyy-MM-dd");
      return holidayList.includes(monthDay) || holidayList.includes(fullDate);
    };

    const safeScheduleDays = batch.schedule_days.map(day => day.toLowerCase());

    let currentCheckDate = new Date(batch.start_date);
    const updates = [];
    const MAX_SEARCH_DAYS = 365; 

    for (const cls of classes) {
      let dateFound = false;
      let loopCounter = 0;

      while (!dateFound) {
        if (loopCounter > MAX_SEARCH_DAYS) {
            throw new AppError(`Failed to schedule Class ${cls.class_number}. Exceeded 1 year limit. Check active days and holidays.`, 400);
        }

        const dayName = formatInTimeZone(currentCheckDate, "Asia/Dhaka", "EEEE").toLowerCase();

        if (safeScheduleDays.includes(dayName) && !isHoliday(currentCheckDate)) {
          updates.push({
            updateOne: {
              filter: { _id: cls._id },
              update: { date_scheduled: new Date(currentCheckDate) }
            }
          });
          dateFound = true;
        }
        
        currentCheckDate = addDays(currentCheckDate, 1);
        loopCounter++;
      }
    }

    if (updates.length > 0) {
      await ClassContent.bulkWrite(updates, { session });
    }
  });
};