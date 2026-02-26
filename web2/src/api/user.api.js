import { API } from "./axios.js";

// Get all users/employees with pagination and filters
export const fetchUsers = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/users/all?${params}`);
  return data;
};

// Get a single user by ID
export const fetchUserById = async (id) => {
  const { data } = await API.get(`/users/${id}`);
  return data;
};

// Search users by ID, Name, Username, or Email
export const fetchUserBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const { data } = await API.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
  return data;
};

// Add a new user (handles form data / image uploads)
export const addUser = async (formData) => {
  const { data } = await API.post("/users/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Update an existing user (handles form data / image uploads)
export const updateUser = async ({ id, formData }) => {
  const { data } = await API.put(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Update user status (e.g., 'Active', 'On Leave', 'Resigned')
export const updateUserStatus = async ({ id, status }) => {
  const { data } = await API.patch(`/users/update-status/${id}`, { status });
  return data;
};

// Update/Toggle User Role (Promote to admin or demote to staff)
export const updateUserRole = async ({ id, role }) => {
  const { data } = await API.patch(`/users/${id}/role`, { role });
  return data;
};

// Delete a user permanently
export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data;
};

// Remove a user's photo without deleting the profile
export const removeUserPhoto = async (id) => {
  const { data } = await API.delete(`/users/${id}/image`);
  return data;
};