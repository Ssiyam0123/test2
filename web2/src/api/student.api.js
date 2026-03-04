import { API } from "./axios.js";

export const fetchStudents = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/students/all?${params}`);
  return data;
};

// 🚀 FIXED: Unwrapping ApiResponse data
export const fetchAdminStudentById = async (id) => {
  const { data } = await API.get(`/students/admin/${id}`);
  return data.data; 
};

// 🚀 FIXED: Unwrapping ApiResponse data
export const fetchPublicStudentById = async (id) => {
  const { data } = await API.get(`/students/public/${id}`);
  return data.data; 
};

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

export const addStudentComment = async ({ studentId, text }) => {
  const { data } = await API.post(`/students/${studentId}/comments`, { text });
  return data;
};

export const fetchStudentComments = async (studentId) => {
  const { data } = await API.get(`/students/${studentId}/comments`);
  return data;
};

export const fetchAdminStudentBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const { data } = await API.get(`/students/search?query=${encodeURIComponent(query.trim())}`);
  return data;
};

export const downloadStudentCertificate = async (studentId) => {
  const response = await API.get(`/generate-certificate/download/${studentId}`, { 
    responseType: "blob" 
  });
  return response.data;
};