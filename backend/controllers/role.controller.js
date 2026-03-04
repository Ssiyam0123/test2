import Role from "../models/role.js";
import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js"; // 🚀 Added Global Response Handler

// ==========================================
// 🐳 [Controller: createRole]
// ==========================================
export const createRole = catchAsync(async (req, res, next) => {
  const { name, description, permissions } = req.body;

  const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  if (existingRole) {
    return next(new AppError(`The role '${name}' already exists.`, 400));
  }

  const role = await Role.create({
    name,
    description,
    permissions: permissions || [],
    is_system_role: false 
  });

  // 🚀 Using Global Response Handler
  res.status(201).json(new ApiResponse(201, role, "Role created successfully."));
});

// ==========================================
// 🐳 [Controller: getRoles]
// ==========================================
export const getRoles = catchAsync(async (req, res, next) => {
  const roles = await Role.find().sort({ is_system_role: -1, name: 1 });
  
  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, roles, "Roles fetched successfully"));
});

// ==========================================
// 🐳 [Controller: getRoleById]
// ==========================================
export const getRoleById = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new AppError("Role not found.", 404));
  }
  
  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, role, "Role details fetched"));
});

// ==========================================
// 🐳 [Controller: updateRole]
// ==========================================
export const updateRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  const role = await Role.findById(id);
  if (!role) {
    return next(new AppError("Role not found.", 404));
  }

  if (role.is_system_role && name && name !== role.name) {
    return next(new AppError("You cannot change the name of a core system role.", 400));
  }

  // Apply updates
  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;

  await role.save();

  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, role, "Role updated successfully."));
});

// ==========================================
// 🐳 [Controller: deleteRole]
// ==========================================
export const deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const role = await Role.findById(id);
  if (!role) {
    return next(new AppError("Role not found.", 404));
  }

  // SECURITY 1: Never delete a system role
  if (role.is_system_role) {
    return next(new AppError(`Cannot delete '${role.name}' because it is a protected system role.`, 403));
  }

  const usersWithRole = await User.countDocuments({ role: id });
  if (usersWithRole > 0) {
    return next(new AppError(`Cannot delete this role. There are ${usersWithRole} user(s) currently assigned to it.`, 400));
  }

  await Role.findByIdAndDelete(id);
  
  // 🚀 Using Global Response Handler
  res.status(200).json(new ApiResponse(200, null, "Role deleted successfully."));
});