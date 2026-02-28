import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import { addDays, format, startOfDay } from "date-fns";
import mongoose from "mongoose";

// ==========================================
// ZONE 1: CORE BATCH OPERATIONS (CRUD)
export const createBatch = async (req, res) => {
  try {
    // 1. Log the incoming data so we can see exactly what the frontend is sending
    console.log("📦 Incoming Batch Payload:", req.body);

    const newBatch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: newBatch });
  } catch (error) {
    console.error("❌ BATCH CREATE ERROR:", error);

    // 2. Properly handle Mongoose Validation & Cast Errors as 400 Bad Request
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// ... (keep createBatch, getBatchById, updateBatch, deleteBatch as you have them)

export const getAllBatches = async (req, res) => {
  try {
    const { status, branch } = req.query;
    let query = {};

    // ==========================================
    // SECURITY GATE: Branch Isolation
    // ==========================================
    if (req.user.role === "admin") {
      // Admin: Filter by specific branch if requested
      if (
        branch &&
        branch !== "all" &&
        mongoose.Types.ObjectId.isValid(branch)
      ) {
        query.branch = branch;
      }
    } else {
      // Staff: Forced to only see batches in their own branch
      query.branch = req.user.branch;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const batches = await Batch.find(query)
      .populate("course", "course_name")
      .populate("branch", "branch_name branch_code") // Populate Branch for the UI
      .populate("students", "student_name student_id photo_url")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    console.error("GET_ALL_BATCHES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ... keep your ZONE 2 & ZONE 3 code exactly as it is.

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("course")
      .populate("instructors", "full_name email photo_url") // Changed to 'instructors' array
      .populate("branch", "branch_name branch_code")
      .populate("students", "student_name student_id photo_url");

    if (!batch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    ).populate("course", "course_name");

    if (!updatedBatch) {
      return res
        .status(404)
        .json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({ success: true, data: updatedBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete all classes belonging to this batch
    await ClassContent.deleteMany({ batch: id });

    // 2. Delete the batch itself
    await Batch.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Batch and curriculum deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ZONE 2: SYLLABUS ENGINE (CLASS MANAGEMENT)
// ==========================================

export const getBatchClasses = async (req, res) => {
  try {
    const classes = await ClassContent.find({ batch: req.params.batchId }).sort(
      { createdAt: 1 },
    );
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
        cleanClassNumber =
          parseInt(cleanClassNumber.replace(/\D/g, ""), 10) || 0;
      }

      return {
        ...cls,
        batch: batchId,
        class_number: cleanClassNumber,
        content_details:
          typeof cls.content_details === "string"
            ? cls.content_details
                .split("\n")
                .filter((item) => item.trim() !== "")
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

// export const updateClassContent = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const updateData = req.body;

//     // Handle string-to-array conversion for textareas
//     if (
//       updateData.content_details &&
//       typeof updateData.content_details === "string"
//     ) {
//       updateData.content_details = updateData.content_details
//         .split("\n")
//         .filter((i) => i.trim());
//     }

//     const updated = await ClassContent.findByIdAndUpdate(classId, updateData, {
//       new: true,
//     });
//     res.status(200).json({ success: true, data: updated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const updateClassContent = async (req, res) => {
  try {
    const { classId } = req.params;
    const updateData = { ...req.body };

    // 1. Handle string-to-array conversion for textareas
    if (
      updateData.content_details &&
      typeof updateData.content_details === "string"
    ) {
      updateData.content_details = updateData.content_details
        .split("\n")
        .filter((i) => i.trim());
    }

    // 2. Safe nested object update for Financials
    // If the frontend sends the financials object, we ensure it's structured properly
    // without overwriting existing data if only a partial update is sent.
    if (updateData.financials) {
      // Create a dot-notation update object specifically for nested fields
      // This prevents Mongoose from overwriting the entire object if only 'budget' is sent
      const financialUpdates = {};
      if (updateData.financials.budget !== undefined) {
        financialUpdates["financials.budget"] = Number(
          updateData.financials.budget,
        );
      }
      if (updateData.financials.actual_cost !== undefined) {
        financialUpdates["financials.actual_cost"] = Number(
          updateData.financials.actual_cost,
        );
      }
      if (updateData.financials.expense_notes !== undefined) {
        financialUpdates["financials.expense_notes"] =
          updateData.financials.expense_notes;
      }

      // Delete the raw object from updateData so it doesn't conflict
      delete updateData.financials;

      // Merge the safe dot-notation paths back in
      Object.assign(updateData, financialUpdates);
    }

    const updated = await ClassContent.findByIdAndUpdate(classId, updateData, {
      new: true,
    });

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
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    // Remove reference from Batch
    await Batch.findByIdAndUpdate(classToDelete.batch, {
      $pull: { class_contents: classId },
    });

    // Delete actual class document
    await ClassContent.findByIdAndDelete(classId);

    res
      .status(200)
      .json({ success: true, message: "Class deleted and batch updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ZONE 3: OPERATIONAL ENGINE (SCHEDULE & ATTENDANCE)
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

    res
      .status(200)
      .json({ success: true, message: "Class scheduled", data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { attendanceRecords, instructorId, is_completed, financials } = req.body; 

    // 1. Fetch the existing class to grab the Batch and Branch routing IDs
    const classRecord = await ClassContent.findById(classId).populate("batch");
    if (!classRecord) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const batchId = classRecord.batch._id;
    const branchId = classRecord.batch.branch; 

    // 2. Update the Class details (Attendance + Financial Summary)
    const updatedClass = await ClassContent.findByIdAndUpdate(
      classId,
      { 
        attendance: attendanceRecords,
        instructor: instructorId || classRecord.instructor, 
        is_completed: is_completed !== undefined ? is_completed : true,
        ...(financials && { financials }) // Inject financials if provided in the payload
      },
      { new: true },
    ).populate("attendance.student", "student_name student_id photo_url");

    // 3. 💸 AUTOMATED EXPENSE SYNC
    // If the instructor submitted an actual cost greater than 0, sync it to the global ledger
    if (financials && financials.actual_cost > 0) {
      const existingExpense = await Expense.findOne({ class_content: classId });

      if (existingExpense) {
        // Update existing expense if they made a typo and are resubmitting
        existingExpense.amount = financials.actual_cost;
        existingExpense.title = financials.expense_notes || `Class ${classRecord.class_number} Expenses`;
        existingExpense.recorded_by = req.user._id;
        await existingExpense.save();
      } else {
        // Create a brand new expense record tied to all 3 hierarchy levels
        await Expense.create({
          title: financials.expense_notes || `Class ${classRecord.class_number} Expenses`,
          amount: financials.actual_cost,
          class_content: classId,
          batch: batchId,
          branch: branchId,
          recorded_by: req.user._id, // Tracks exactly who logged this cost
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Class record and financial ledger updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// export const updateClassAttendance = async (req, res) => {
//   try {
//     const { classId } = req.params;
//     const { attendanceRecords, instructorId, is_completed } = req.body;

//     const updatedClass = await ClassContent.findByIdAndUpdate(
//       classId,
//       {
//         attendance: attendanceRecords,
//         instructor: instructorId || null, // Logs EXACTLY who taught this class
//         is_completed: is_completed !== undefined ? is_completed : true, // Auto-marks class as done
//       },
//       { new: true },
//     ).populate("attendance.student", "student_name student_id photo_url");

//     res.status(200).json({
//       success: true,
//       message: "Attendance and class status updated successfully",
//       data: updatedClass,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// Auto-Schedule Configurations
const bdHolidays = [
  "02-21",
  "03-17",
  "03-26",
  "04-14",
  "05-01",
  "08-15",
  "12-16",
  "12-25",
  "2026-03-03",
  "2026-03-20",
  "2026-03-21",
  "2026-03-22",
  "2026-05-27",
  "2026-05-28",
  "2026-05-29",
  "2026-06-26",
  "2026-10-21",
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
      return res.status(400).json({
        success: false,
        message: "Batch missing Start Date or Schedule Days",
      });
    }

    const classes = await ClassContent.find({ batch: batchId }).sort({
      class_number: 1,
    });

    if (classes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Syllabus is empty." });
    }

    let currentCheckDate = startOfDay(new Date(batch.start_date));
    const updates = [];

    for (const cls of classes) {
      let dateFound = false;

      while (!dateFound) {
        const dayName = format(currentCheckDate, "EEEE");

        // Assign date if it matches a schedule day and is NOT a holiday
        if (
          batch.schedule_days.includes(dayName) &&
          !isHoliday(currentCheckDate)
        ) {
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
