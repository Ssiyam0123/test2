import { API } from "./axios.js";

export const fetchUsers = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/users/all?${params}`);
  return data; // Same pagination logic as students
};

export const fetchUserById = async (id) => {
  const { data } = await API.get(`/users/${id}`);
  return data.data; 
};

export const fetchUserBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const { data } = await API.get(`/users/search?query=${encodeURIComponent(query.trim())}`);
  return data.data;
};

export const addUser = async (formData) => {
  const { data } = await API.post("/users/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const updateUser = async ({ id, formData }) => {
  const { data } = await API.put(`/users/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const updateUserStatus = async ({ id, status }) => {
  const { data } = await API.patch(`/users/update-status/${id}`, { status });
  return data.data;
};

export const updateUserRole = async ({ id, role }) => {
  const { data } = await API.patch(`/users/${id}/role`, { role });
  return data.data;
};

export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data.data;
};

export const removeUserPhoto = async (id) => {
  const { data } = await API.delete(`/users/${id}/image`);
  return data.data;
};


export const fetchMyProfile = async () => {
  const { data } = await API.get("/users/profile/me");
  return data.data;
};

export const updateMyProfile = async (formData) => {
  const { data } = await API.put("/users/profile/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};