import { API } from "./axios";

export const fetchBatchClasses = async (batchId) => {
  const { data } = await API.get(`/classes/batch/${batchId}`);
  return data.data;
};

export const addSyllabusItems = async (batchId, syllabusData) => {
  const { data } = await API.post(`/classes/batch/${batchId}`, syllabusData);
  return data.data;
};

export const autoScheduleBatch = async (batchId) => {
  const { data } = await API.post(`/classes/batch/${batchId}/auto-schedule`);
  return data.data;
};

export const updateClassContent = async ({ classId, updateData }) => {
  const { data } = await API.put(`/classes/${classId}`, updateData);
  return data.data;
};

export const deleteClassContent = async (classId) => {
  const { data } = await API.delete(`/classes/${classId}`);
  return data.data;
};

export const scheduleClass = async ({ classId, date_scheduled }) => {
  const { data } = await API.put(`/classes/${classId}/schedule`, { date_scheduled });
  return data.data;
};

export const updateClassAttendance = async ({ classId, payload }) => {
  const { data } = await API.put(`/classes/${classId}/attendance`, payload);
  return data.data;
};