import { API } from "./axios";

export const fetchAllMasterTopics = async (params) => {
  const { data } = await API.get(`/syllabus`, { params });
  return data.data;
};

export const fetchSyllabusTopic = async (id) => {
  const { data } = await API.get(`/syllabus/topic/${id}`);
  return data.data;
};

export const addMasterSyllabus = async (payload) => {
  const { data } = await API.post(`/syllabus`, payload);
  return data.data;
};

export const updateMasterSyllabus = async ({ id, payload }) => {
  const { data } = await API.put(`/syllabus/topic/${id}`, payload);
  return data.data;
};

export const deleteMasterSyllabus = async (id) => {
  const { data } = await API.delete(`/syllabus/topic/${id}`);
  return data.data;
};