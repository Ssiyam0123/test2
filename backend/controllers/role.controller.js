import * as RoleService from "../services/role.service.js";
import catchAsync from "../utils/catchAsync.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getRoles = catchAsync(async (req, res) => {
  const roles = await RoleService.fetchRoles();
  res.status(200).json(new ApiResponse(200, roles, "Roles fetched successfully"));
});

export const getRoleById = catchAsync(async (req, res) => {
  const role = await RoleService.fetchRoleById(req.params.id);
  res.status(200).json(new ApiResponse(200, role, "Role fetched"));
});

export const createRole = catchAsync(async (req, res) => {
  const newRole = await RoleService.createRole(req.body);
  res.status(201).json(new ApiResponse(201, newRole, "Role created successfully"));
});

export const updateRole = catchAsync(async (req, res) => {
  console.log("🚀 PUT Request Hit!");
  console.log("Role ID:", req.params.id);
  console.log("Payload (req.body):", req.body); // 👈 এটা ফাঁকা ({}) আসলে 500 খাবি!

  const updatedRole = await RoleService.modifyRole(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, updatedRole, "Permissions updated successfully"));
});
export const deleteRole = catchAsync(async (req, res) => {
  await RoleService.removeRole(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Role deleted successfully"));
});