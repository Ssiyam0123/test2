import Expense from "../models/expense.js";


export const getExpenses = async (req, res) => {
  try {
    const { branchId, batchId, classId } = req.query;
    
    let filter = {};
    if (classId) filter.class_content = classId;
    else if (batchId) filter.batch = batchId;
    else if (branchId) filter.branch = branchId;

    const expenses = await Expense.find(filter)
      .sort({ date_incurred: -1 }) // Newest first
      .populate("class_content", "class_number topic")
      .populate("recorded_by", "full_name");

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};