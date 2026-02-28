import Batch from "../models/batch.js";
import ClassContent from "../models/classContent.js";
import mongoose from "mongoose";

// ==========================================
// CORE BATCH OPERATIONS (CRUD)
// ==========================================

export const createBatch = async (req, res) => {
  try {
    console.log("📦 Incoming Batch Payload:", req.body);
    const newBatch = await Batch.create(req.body);
    res.status(201).json({ success: true, data: newBatch });
  } catch (error) {
    console.error("❌ BATCH CREATE ERROR:", error);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const { status, branch } = req.query;
    let query = {};

    // SECURITY GATE: Branch Isolation
    if (req.user.role === "admin") {
      if (branch && branch !== "all" && mongoose.Types.ObjectId.isValid(branch)) {
        query.branch = branch;
      }
    } else {
      query.branch = req.user.branch;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const batches = await Batch.find(query)
      .populate("course", "course_name")
      .populate("branch", "branch_name branch_code")
      .populate("students", "student_name student_id photo_url")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    console.error("GET_ALL_BATCHES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("course")
      .populate("instructors", "full_name email photo_url")
      .populate("branch", "branch_name branch_code")
      .populate("students", "student_name student_id photo_url");

    if (!batch) {
      return res.status(404).json({ success: false, message: "Batch not found" });
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
      return res.status(404).json({ success: false, message: "Batch not found" });
    }

    res.status(200).json({ success: true, data: updatedBatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cascade delete: Remove all classes when batch is deleted
    await ClassContent.deleteMany({ batch: id });
    await Batch.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Batch and curriculum deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};