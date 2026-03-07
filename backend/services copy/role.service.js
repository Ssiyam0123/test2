import Role from "../models/role.js";
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

export const createRole = async (roleData) => {
  const { name, description, permissions } = roleData;

  const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } }).lean();
  if (existingRole) {
    throw new AppError(`The role '${name}' already exists.`, 409);
  }

  const newRole = new Role({
    name,
    description,
    permissions: permissions || [],
    is_system_role: false
  });

  await newRole.save();
  return newRole;
};

export const fetchRoles = async () => {
  return await Role.find().sort({ is_system_role: -1, name: 1 }).lean();
};

export const fetchRoleById = async (roleId) => {
  const role = await Role.findById(roleId).lean();
  if (!role) throw new AppError("Role not found.", 404);
  return role;
};

export const modifyRole = async (roleId, updateData) => {
  const role = await Role.findById(roleId);
  if (!role) throw new AppError("Role not found.", 404);

  if (role.is_system_role && updateData.name && updateData.name !== role.name) {
    throw new AppError("System role names are immutable.", 403);
  }

  if (updateData.name) role.name = updateData.name;
  if (updateData.description !== undefined) role.description = updateData.description;
  if (updateData.permissions) role.permissions = updateData.permissions;

  await role.save();
  return role;
};

export const removeRole = async (roleId) => {
  const role = await Role.findById(roleId).lean();
  if (!role) throw new AppError("Role not found.", 404);

  if (role.is_system_role) {
    throw new AppError(`Cannot delete protected system role: '${role.name}'.`, 403);
  }

  const usersWithRole = await User.countDocuments({ role: roleId });
  if (usersWithRole > 0) {
    throw new AppError(`Constraint violation: ${usersWithRole} user(s) currently mapped to this role.`, 409);
  }

  await Role.findByIdAndDelete(roleId);
};