import { API } from "./axios";

// ==============================
// BATCH ENDPOINTS
// ==============================

export const fetchBatches = async () => {
  const { data } = await API.get("/batches");
  return data;
};

export const fetchBatchesByStatus = async (status = "all") => {
  const { data } = await API.get(`/batches?status=${status}`);
  return data;
};

export const fetchBatchById = async (id) => {
  const { data } = await API.get(`/batches/${id}`);
  return data;
};

export const createBatch = async (batchData) => {
  const { data } = await API.post("/batches", batchData);
  return data;
};

export const updateBatch = async (id, updateData) => {
  const { data } = await API.put(`/batches/${id}`, updateData);
  return data;
};

export const deleteBatch = async (id) => {
  const { data } = await API.delete(`/batches/${id}`);
  return data;
};

export const autoScheduleBatch = async (batchId) => {
  const { data } = await API.post(`/batches/${batchId}/auto-schedule`);
  return data;
};

// ==============================
// CLASS / SYLLABUS ENDPOINTS
// ==============================

export const fetchBatchClasses = async (batchId) => {
  const { data } = await API.get(`/batches/${batchId}/classes`);
  return data;
};

export const addSyllabusItem = async (batchId, syllabusData) => {
  const { data } = await API.post(`/batches/${batchId}/syllabus`, syllabusData);
  return data;
};

export const updateClassContent = async (classId, updateData) => {
  const { data } = await API.put(`/batches/classes/${classId}`, updateData);
  return data;
};

export const deleteClassContent = async (classId) => {
  const { data } = await API.delete(`/batches/classes/${classId}`);
  return data;
};

export const scheduleClass = async (classContentId, date_scheduled) => {
  const { data } = await API.put(`/batches/classes/${classContentId}/schedule`, { date_scheduled });
  return data;
};

// ==============================
// ATTENDANCE ENDPOINTS
// ==============================

// For updating attendance on a specific class
export const updateClassAttendance = async (classId, attendanceRecords) => {
  const { data } = await API.put(`/batches/classes/${classId}/attendance`, { attendanceRecords });
  return data;
};

// Legacy/Alternative endpoint based on your original code
export const updateBatchAttendance = async (batchId, attendanceData) => {
  const { data } = await API.post(`/batches/${batchId}/attendance`, attendanceData);
  return data;
};