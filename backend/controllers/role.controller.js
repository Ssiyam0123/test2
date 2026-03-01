import Role from "../models/Role.js";
import User from "../models/user.js";

// ==========================================
// 1. CREATE A NEW CUSTOM ROLE
// ==========================================
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Check if role name already exists (case-insensitive)
    const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingRole) {
      return res.status(400).json({ success: false, message: `The role '${name}' already exists.` });
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      is_system_role: false // Custom roles created via UI are never system roles
    });

    res.status(201).json({ success: true, message: "Role created successfully.", data: role });
  } catch (error) {
    console.error("Create Role Error:", error);
    res.status(500).json({ success: false, message: "Failed to create role." });
  }
};

// ==========================================
// 2. GET ALL ROLES (For the UI Dropdowns & Manager)
// ==========================================
export const getRoles = async (req, res) => {
  try {
    // Sort by system roles first, then alphabetically by name
    const roles = await Role.find().sort({ is_system_role: -1, name: 1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error("Fetch Roles Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roles." });
  }
};

// ==========================================
// 3. GET SINGLE ROLE
// ==========================================
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found." });
    }
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Fetch Role Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch role." });
  }
};

// ==========================================
// 4. UPDATE A ROLE (Add/Remove Permissions)
// ==========================================
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found." });
    }

    // SECURITY: Prevent renaming core system roles (like "superadmin")
    if (role.is_system_role && name && name !== role.name) {
      return res.status(400).json({ 
        success: false, 
        message: "You cannot change the name of a core system role." 
      });
    }

    // Apply updates
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    res.status(200).json({ success: true, message: "Role updated successfully.", data: role });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ success: false, message: "Failed to update role." });
  }
};

// ==========================================
// 5. DELETE A ROLE (With Safety Checks)
// ==========================================
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found." });
    }

    // SECURITY 1: Never delete a system role
    if (role.is_system_role) {
      return res.status(403).json({ 
        success: false, 
        message: `Cannot delete '${role.name}' because it is a protected system role.` 
      });
    }

    // SECURITY 2: Never delete a role if an employee is currently using it
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete this role. There are ${usersWithRole} user(s) currently assigned to it.` 
      });
    }

    await Role.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Role deleted successfully." });
  } catch (error) {
    console.error("Delete Role Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete role." });
  }
};