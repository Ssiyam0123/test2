import mongoose from "mongoose";
import Batch from "../models/batch.js";

export const validateBatchRequiredFields = (req, res, next) => {
  const isUpdate = req.method === "PUT";
  const { batch_name, course, branch, start_date, schedule_days, start_time, end_time } = req.body;
  
  if (!isUpdate) {
    // Determine the effective branch (Admin sends it, Registrar auto-gets it)
    const effectiveBranch = branch || (req.user && req.user.role !== 'admin' ? req.user.branch : null);

    if (!batch_name || !course || !effectiveBranch || !start_date) {
      return res.status(400).json({ message: "Batch name, course, branch, and start date are required." });
    }

    // ==========================================
    // 🛡️ PREVENT 500 CAST ERRORS
    // ==========================================
    // If the frontend sends the default placeholder text instead of an ID, block it here.
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({ message: "Please select a valid Course." });
    }
    if (!mongoose.Types.ObjectId.isValid(effectiveBranch)) {
      return res.status(400).json({ message: "Please select a valid Campus/Branch." });
    }

    if (!schedule_days || schedule_days.length === 0) {
      return res.status(400).json({ message: "At least one class day must be selected." });
    }
    if (!start_time || !end_time) {
      return res.status(400).json({ message: "Start and End times are required." });
    }
  }
  next();
};

export const checkBatchDuplicates = async (req, res, next) => {
  try {
    const { batch_name } = req.body;
    const excludeDbId = req.params.id || null;

    if (!batch_name) return next();

    const query = { batch_name: new RegExp(`^${batch_name.trim()}$`, "i") };
    if (excludeDbId) query._id = { $ne: excludeDbId };

    const existingBatch = await Batch.findOne(query).select('batch_name');
    if (existingBatch) {
      return res.status(400).json({ message: `Batch name "${batch_name}" already exists.` });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error validating batch duplicates" });
  }
};

export const processBatchPayload = (req, res, next) => {
  try {
    // Auto-inject branch ID for non-admins so they don't have to select it
    if (req.user && req.user.role !== 'admin') {
      req.body.branch = req.user.branch;
    }

    // ==========================================
    // 👨‍🏫 INSTRUCTOR ARRAY FORMATTING
    // ==========================================
    // If only one instructor is selected, some frontends send it as a string instead of an array.
    // This ensures Mongoose always receives an array.
    if (req.body.instructors) {
      if (!Array.isArray(req.body.instructors)) {
        req.body.instructors = [req.body.instructors];
      }
    }

    // Format Time Slot
    if (req.body.start_time || req.body.end_time) {
      req.body.time_slot = {
        start_time: req.body.start_time || req.body.time_slot?.start_time,
        end_time: req.body.end_time || req.body.time_slot?.end_time
      };
      delete req.body.start_time;
      delete req.body.end_time;
    }

    // Format Date
    if (req.body.start_date) {
      req.body.start_date = new Date(req.body.start_date);
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Payload processing failed" });
  }
};