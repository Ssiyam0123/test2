
import { API } from "./axios.js";

export const fetchStudents = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/students/all?${params}`);
  return data;
};

// Admin: Get student by ID
export const fetchAdminStudentById = async (id) => {
  const { data } = await API.get(`/students/admin/${id}`);
  return data;
};

// Public: Get student by ID (for QR code access)
export const fetchPublicStudentById = async (id) => {
  const { data } = await API.get(`/students/public/${id}`);
  return data;
};

// Public: Search student by ID/Reg Number
export const fetchPublicStudentBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const response = await API.get(`/students/public/search?query=${encodeURIComponent(query.trim())}`);
  return response.data;
};

export const addStudent = async (formData) => {
  const { data } = await API.post("/students/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateStudent = async ({ id, formData }) => {
  const { data } = await API.put(`/students/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const toggleStudentStatus = async (id) => {
  const { data } = await API.patch(`/students/toggle-status/${id}`);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await API.delete(`/students/delete/${id}`);
  return data;
};

export const removeStudentPhoto = async (id) => {
  const { data } = await API.delete(`/students/remove-image/${id}`);
  return data;
};


// Admin/Instructor: Add a comment to a student
export const addStudentComment = async ({ studentId, text }) => {
  const { data } = await API.post(`/students/${studentId}/comments`, { text });
  return data;
};

// Admin/Instructor: Fetch all comments for a student
export const fetchStudentComments = async (studentId) => {
  const { data } = await API.get(`/students/${studentId}/comments`);
  return data;
};


