import * as RoleService from "../services/role.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createRole = catchAsync(async (req, res) => {
  const role = await RoleService.createRole(req.body);
  res.status(201).json(new ApiResponse(201, role, "Role created successfully."));
});

export const getRoles = catchAsync(async (req, res) => {
  const roles = await RoleService.fetchRoles();
  res.status(200).json(new ApiResponse(200, roles, "Roles fetched successfully."));
});

export const getRoleById = catchAsync(async (req, res) => {
  const role = await RoleService.fetchRoleById(req.params.id);
  res.status(200).json(new ApiResponse(200, role, "Role details fetched."));
});

export const updateRole = catchAsync(async (req, res) => {
  const role = await RoleService.modifyRole(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, role, "Role updated successfully."));
});

export const deleteRole = catchAsync(async (req, res) => {
  await RoleService.removeRole(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Role deleted successfully."));
});