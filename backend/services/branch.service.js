import Branch from "../models/branch.js";
import User from "../models/user.js";
import Student from "../models/student.js";
import AppError from "../utils/AppError.js";

export const createBranch = async (data) => await Branch.create(data);

export const modifyBranch = async (id, data, isMaster, userBranch) => {
  if (!isMaster && id !== userBranch.toString()) throw new AppError("Unauthorized to update this branch", 403);
  
  const updatedBranch = await Branch.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updatedBranch) throw new AppError("Branch not found", 404);
  return updatedBranch;
};

export const fetchAllBranches = async (query, isMaster, userBranch) => {
  const filter = isMaster ? {} : { _id: userBranch };
  if (query.is_active !== undefined) filter.is_active = query.is_active === "true";
  if (query.search) {
    filter.$or = [
      { branch_name: { $regex: query.search, $options: "i" } },
      { branch_code: { $regex: query.search, $options: "i" } }
    ];
  }
  return await Branch.find(filter).sort({ branch_name: 1 }).lean();
};

export const fetchBranchById = async (id, isMaster, userBranch) => {
  if (!isMaster && id !== userBranch.toString()) throw new AppError("Unauthorized access.", 403);
  const branch = await Branch.findById(id).lean();
  if (!branch) throw new AppError("Branch not found", 404);
  return branch;
};

export const switchBranchStatus = async (id) => {
  const branch = await Branch.findById(id);
  if (!branch) throw new AppError("Branch not found", 404);
  branch.is_active = !branch.is_active;
  await branch.save();
  return branch;
};

export const removeBranch = async (id) => {
  const [userCount, studentCount] = await Promise.all([
    User.countDocuments({ branch: id }),
    Student.countDocuments({ branch: id })
  ]);

  if (userCount > 0 || studentCount > 0) {
    throw new AppError("Cannot delete branch with existing users or students.", 400);
  }

  const deleted = await Branch.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Branch not found", 404);
};