import { API } from "./axios";

// Fetch all roles
export const fetchRoles = async () => {
  const response = await API.get("/roles");
  return response.data;
};

// Fetch a single role by ID
export const fetchRoleById = async (id) => {
  const response = await API.get(`/roles/${id}`);
  return response.data;
};

// Create a new role
export const createRole = async (roleData) => {
  const response = await API.post("/roles", roleData);
  return response.data;
};

// Update an existing role
export const updateRole = async (id, roleData) => {
  const response = await API.put(`/roles/${id}`, roleData);
  return response.data;
};

// Delete a role
export const deleteRole = async (id) => {
  const response = await API.delete(`/roles/${id}`);
  return response.data;
};