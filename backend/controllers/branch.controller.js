import Branch from "../models/branch.js";
import User from "../models/user.js";
import Student from "../models/student.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";


export const createBranch = catchAsync(async (req, res, next) => {
  if (!req.isMaster) return next(new AppError("Only Super Admins can create branches", 403));
  
  const newBranch = await Branch.create(req.body);
  res.status(201).json(new ApiResponse(201, newBranch, "Branch created"));
});


export const updateBranch = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!req.isMaster && id !== req.user.branch.toString()) {
    return next(new AppError("Unauthorized to update this branch", 403));
  }

  const updatedBranch = await Branch.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!updatedBranch) return next(new AppError("Branch not found", 404));

  res.status(200).json(new ApiResponse(200, updatedBranch, "Branch updated"));
});


export const getAllBranches = catchAsync(async (req, res, next) => {
  // 🚀 Logic: SuperAdmin sees all, Branch Manager only sees theirs
  const filter = req.isMaster ? {} : { _id: req.user.branch };
  
  const { is_active, search } = req.query;
  if (is_active !== undefined) filter.is_active = is_active === "true";
  if (search) {
    filter.$or = [
      { branch_name: { $regex: search, $options: "i" } },
      { branch_code: { $regex: search, $options: "i" } }
    ];
  }

  const branches = await Branch.find(filter).sort({ branch_name: 1 }).lean();
  res.status(200).json(new ApiResponse(200, branches, "Branches fetched"));
});

export const getBranchById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!req.isMaster && id !== req.user.branch.toString()) {
    return next(new AppError("Unauthorized access.", 403));
  }

  const branch = await Branch.findById(id).lean();
  if (!branch) return next(new AppError("Branch not found", 404));

  res.status(200).json(new ApiResponse(200, branch, "Branch details fetched"));
});


export const toggleBranchStatus = catchAsync(async (req, res, next) => {
  if (!req.isMaster) return next(new AppError("Unauthorized action", 403));

  const branch = await Branch.findById(req.params.id);
  if (!branch) return next(new AppError("Branch not found", 404));

  branch.is_active = !branch.is_active;
  await branch.save();

  res.status(200).json(new ApiResponse(200, branch, "Branch status toggled"));
});

export const deleteBranch = catchAsync(async (req, res, next) => {
  if (!req.isMaster) return next(new AppError("Unauthorized action", 403));

  const { id } = req.params;
  const [userCount, studentCount] = await Promise.all([
    User.countDocuments({ branch: id }),
    Student.countDocuments({ branch: id })
  ]);

  if (userCount > 0 || studentCount > 0) {
    return next(new AppError("Cannot delete branch with existing users or students.", 400));
  }

  await Branch.findByIdAndDelete(id);
  res.status(200).json(new ApiResponse(200, null, "Branch deleted"));
});