import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import Expense from "../models/expense.js"; // Needed for your attendance/financial sync
import { addDays, format, startOfDay } from "date-fns";
import mongoose from "mongoose";

// ==========================================
// SYLLABUS ENGINE (CLASS MANAGEMENT)
// ==========================================

export const getBatchClasses = async (req, res) => {
  try {
    const classes = await ClassContent.find({ batch: req.params.batchId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addClassToSyllabus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const classesData = Array.isArray(req.body) ? req.body : [req.body];

    const formattedClasses = classesData.map((cls) => {
      let cleanClassNumber = cls.class_number;
      if (typeof cleanClassNumber === "string") {
        cleanClassNumber = parseInt(cleanClassNumber.replace(/\D/g, ""), 10) || 0;
      }

      return {
        ...cls,
        batch: batchId,
        class_number: cleanClassNumber,
        content_details: typeof cls.content_details === "string"
            ? cls.content_details.split("\n").filter((item) => item.trim() !== "")
            : cls.content_details || [],
        date_scheduled: null,
      };
    });

    const newClasses = await ClassContent.insertMany(formattedClasses);
    const newIds = newClasses.map((c) => c._id);

    await Batch.findByIdAndUpdate(batchId, {
      $push: { class_contents: { $each: newIds } },
    });

    res.status(201).json({
      success: true,
      message: `${newClasses.length} items added to syllabus`,
      data: newClasses,
    });
  } catch (error) {
    console.error("SYLLABUS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClassContent = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = { ...req.body };

    if (updateData.content_details && typeof updateData.content_details === "string") {
      updateData.content_details = updateData.content_details.split("\n").filter((i) => i.trim());
    }

    // Safe nested object update for Financials
    if (updateData.financials) {
      const financialUpdates = {};
      if (updateData.financials.budget !== undefined) {
        financialUpdates["financials.budget"] = Number(updateData.financials.budget);
      }
      if (updateData.financials.actual_cost !== undefined) {
        financialUpdates["financials.actual_cost"] = Number(updateData.financials.actual_cost);
      }
      if (updateData.financials.expense_notes !== undefined) {
        financialUpdates["financials.expense_notes"] = updateData.financials.expense_notes;
      }

      delete updateData.financials;
      Object.assign(updateData, financialUpdates);
    }

    const updated = await ClassContent.findByIdAndUpdate(classId, updateData, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClassContent = async (req, res) => {
  try {
    const { classId } = req.params;
    const classToDelete = await ClassContent.findById(classId);
    
    if (!classToDelete) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    await Batch.findByIdAndUpdate(classToDelete.batch, {
      $pull: { class_contents: classId },
    });

    await ClassContent.findByIdAndDelete(classId);
    res.status(200).json({ success: true, message: "Class deleted and batch updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// OPERATIONAL ENGINE (SCHEDULE & ATTENDANCE)
// ==========================================

export const scheduleClass = async (req, res) => {
  try {
    const { classContentId } = req.params;
    const { date_scheduled } = req.body;

    const updatedClass = await ClassContent.findByIdAndUpdate(
      classContentId,
      { date_scheduled },
      { new: true },
    );

    res.status(200).json({ success: true, message: "Class scheduled", data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { attendanceRecords, instructorId, is_completed, financials } = req.body;

    const classRecord = await ClassContent.findById(classId).populate("batch");
    if (!classRecord) return res.status(404).json({ message: "Class not found" });

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

    // Sync to global ledger if costs were logged
    if (financials?.actual_cost > 0) {
      await Expense.findOneAndUpdate(
        { class_content: classId },
        {
          amount: financials.actual_cost,
          title: financials.expense_notes || `Class ${classRecord.class_number} Bazar`,
          batch: classRecord.batch._id,
          branch: classRecord.batch.branch,
          recorded_by: req.user._id,
        },
        { upsert: true },
      );
    }

    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-Schedule Configurations
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

export const autoScheduleSyllabus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch || !batch.start_date || !batch.schedule_days?.length) {
      return res.status(400).json({ success: false, message: "Batch missing Start Date or Schedule Days" });
    }

    const classes = await ClassContent.find({ batch: batchId }).sort({ class_number: 1 });

    if (classes.length === 0) {
      return res.status(400).json({ success: false, message: "Syllabus is empty." });
    }

    let currentCheckDate = startOfDay(new Date(batch.start_date));
    const updates = [];

    for (const cls of classes) {
      let dateFound = false;

      while (!dateFound) {
        const dayName = format(currentCheckDate, "EEEE");

        if (batch.schedule_days.includes(dayName) && !isHoliday(currentCheckDate)) {
          updates.push(
            ClassContent.findByIdAndUpdate(cls._id, {
              date_scheduled: new Date(currentCheckDate),
            }).exec(),
          );
          dateFound = true;
        }

        currentCheckDate = addDays(currentCheckDate, 1);
      }
    }

    await Promise.all(updates);
    res.status(200).json({
      success: true,
      message: `Calendar generated successfully starting from ${format(new Date(batch.start_date), "PPP")}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};