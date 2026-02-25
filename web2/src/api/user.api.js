import { API } from "./axios.js";

// Admin: Get all users with pagination and filters
export const fetchUsers = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/users/all?${params}`);
  return data;
};

// Admin: Get a single user by ID
export const fetchUserById = async (id) => {
  const { data } = await API.get(`/users/${id}`);
  return data;
};

// Admin: Search users by ID, Name, Username, or Email
export const fetchUserBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const { data } = await API.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
  return data;
};

// Admin: Add a new user (handles form data / image uploads)
export const addUser = async (formData) => {
  const { data } = await API.post("/users/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Admin: Update an existing user (handles form data / image uploads)
export const updateUser = async ({ id, formData }) => {
  const { data } = await API.put(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Admin: Update user status (e.g., 'Active', 'On Leave', 'Resigned')
export const updateUserStatus = async ({ id, status }) => {
  const { data } = await API.patch(`/users/update-status/${id}`, { status });
  return data;
};

// Admin: Toggle Admin Role (Promote to admin or demote to staff)
export const toggleUserRole = async (id) => {
  const { data } = await API.patch(`/users/toggle-role/${id}`);
  return data;
};

// Admin: Delete a user permanently
export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data;
};

// Admin: Remove a user's photo without deleting the profile
export const removeUserPhoto = async (id) => {
  const { data } = await API.delete(`/users/remove-image/${id}`);
  return data;
};