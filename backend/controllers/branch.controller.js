import Branch from "../models/branch.js";
import User from "../models/user.js";
import Student from "../models/student.js";

// ==========================================
// CORE BRANCH OPERATIONS
// ==========================================

export const createBranch = async (req, res) => {
  try {
    // req.body is already trimmed, formatted, and validated by Joi
    const newBranch = await Branch.create(req.body);

    res.status(201).json({ 
      success: true, 
      message: "Branch established successfully", 
      data: newBranch 
    });
  } catch (error) {
    // Rely on MongoDB's native unique index to catch duplicates
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `This ${field} already exists.` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedBranch = await Branch.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Branch details updated", 
      data: updatedBranch 
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `This ${field} already exists.` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBranches = async (req, res) => {
  try {
    const { is_active, search } = req.query;
    let filter = {};

    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { branch_name: searchRegex },
        { branch_code: searchRegex }
      ];
    }

    const branches = await Branch.find(filter).sort({ branch_name: 1 }).lean();
    
    res.status(200).json({ 
      success: true, 
      data: branches,
      count: branches.length 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).lean();
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const toggleBranchStatus = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    branch.is_active = !branch.is_active;
    await branch.save();

    res.status(200).json({ 
      success: true, 
      message: `Branch ${branch.is_active ? 'activated' : 'suspended'} successfully.`, 
      data: branch 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY: Prevent deletion if there are associated records
    const [userCount, studentCount] = await Promise.all([
      User.countDocuments({ branch: id }),
      Student.countDocuments({ branch: id })
    ]);

    if (userCount > 0 || studentCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete branch. It contains ${userCount} users and ${studentCount} students. Suspend the branch instead.` 
      });
    }

    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

    res.status(200).json({ success: true, message: "Branch permanently deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};