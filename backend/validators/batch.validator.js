import Batch from "../models/batch.js";



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

// 1. Check Required Fields
export const validateBatchRequiredFields = (req, res, next) => {
  const isUpdate = req.method === "PUT";
  const { batch_name, course, start_date, schedule_days, start_time, end_time } = req.body;
  
  // During creation, everything is required. 
  // During update, we only check fields that are actually present in the request.
  if (!isUpdate) {
    if (!batch_name || !course || !start_date) {
      return res.status(400).json({ message: "Batch name, course, and start date are required." });
    }
    if (!schedule_days || schedule_days.length === 0) {
      return res.status(400).json({ message: "At least one class day must be selected." });
    }
    if (!start_time || !end_time) {
      return res.status(400).json({ message: "Start time and End time are required." });
    }
  }

  next();
};

// 3. Process Payload (Fixing potential reference errors)
export const processBatchPayload = (req, res, next) => {
  try {
    // Only nest if the times are actually provided (important for partial updates)
    if (req.body.start_time || req.body.end_time) {
      req.body.time_slot = {
        start_time: req.body.start_time || req.body.time_slot?.start_time,
        end_time: req.body.end_time || req.body.time_slot?.end_time
      };
      
      // Don't delete them yet if you have other validators running
      // Or simply check if they exist before deleting
      delete req.body.start_time;
      delete req.body.end_time;
    }

    if (req.body.start_date) {
      req.body.start_date = new Date(req.body.start_date);
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Payload processing failed" });
  }
};