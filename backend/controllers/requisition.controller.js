import Requisition from "../models/requisition.js";
import ClassContent from "../models/classContent.js";
import Expense from "../models/expense.js";

export const getClassRequisition = async (req, res) => {
  try {
    const requisition = await Requisition.findOne({ class_content: req.params.classId });
    // If it doesn't exist yet, return an empty template
    res.status(200).json({ success: true, data: requisition || { items: [], budget: 0, actual_cost: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertRequisition = async (req, res) => {
  try {
    const { classId } = req.params;
    // This matches the new frontend payload you built!
    const { requisition, financials } = req.body; 

    // Look up the class to get the Batch and Branch info for referencing
    const classData = await ClassContent.findById(classId).populate('batch');
    if (!classData) return res.status(404).json({ message: "Class not found" });

    // Update or Insert the Requisition
    const updatedReq = await Requisition.findOneAndUpdate(
      { class_content: classId },
      {
        class_content: classId,
        batch: classData.batch._id,
        branch: classData.batch.branch,
        items: requisition,
        budget: financials?.budget || 0,
        actual_cost: financials?.actual_cost || 0,
        updated_by: req.user._id
      },
      { new: true, upsert: true }
    );

    // If actual cost was entered, log it in the global expenses ledger
    if (financials?.actual_cost > 0) {
      await Expense.findOneAndUpdate(
        { class_content: classId },
        {
          amount: financials.actual_cost,
          title: `Class ${classData.class_number} Bazar`,
          batch: classData.batch._id,
          branch: classData.batch.branch,
          recorded_by: req.user._id
        },
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, data: updatedReq });
  } catch (error) {
    console.error("REQUISITION_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};