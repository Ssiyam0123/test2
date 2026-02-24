import Batch from "../models/batch.js";

// 1. Check Required Fields
export const validateBatchRequiredFields = (req, res, next) => {
  // Removed batch_type from required checks
  const { batch_name, course, start_date, schedule_days, start_time, end_time } = req.body;
  
  if (!batch_name || !course || !start_date) {
    return res.status(400).json({ message: "Batch name, course, and start date are required." });
  }

  if (!schedule_days || schedule_days.length === 0) {
    return res.status(400).json({ message: "At least one class day must be selected." });
  }

  if (!start_time || !end_time) {
    return res.status(400).json({ message: "Start time and End time are required." });
  }

  next();
};

// 2. Check for Duplicate Batch Names (Remains Unchanged)
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

// 3. Process Payload (Dynamic Days & Times)
export const processBatchPayload = (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.batch_name) payload.batch_name = payload.batch_name.trim();

    // Force batch_type to Custom since we are using fully dynamic scheduling now
    payload.batch_type = "Custom";

    // Ensure schedule_days is always an array
    if (payload.schedule_days && !Array.isArray(payload.schedule_days)) {
      payload.schedule_days = [payload.schedule_days];
    }

    // Format the time_slot object required by the schema
    payload.time_slot = {
      start_time: payload.start_time,
      end_time: payload.end_time
    };

    // Clean up temporary fields sent by the frontend
    delete payload.start_time;
    delete payload.end_time;

    // Ensure valid Date object
    if (payload.start_date) {
      payload.start_date = new Date(payload.start_date);
    }

    // Remove undefined properties
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    req.body = payload;
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};