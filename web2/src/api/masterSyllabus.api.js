import { API } from "./axios";

export const fetchAllMasterTopics = async (params) => {
  const { data } = await API.get(`/syllabus`, { params });
  return data;
};

export const fetchSyllabusTopic = async (id) => {
  const { data } = await API.get(`/syllabus/topic/${id}`);
  return data;
};

export const addMasterSyllabus = async (payload) => {
  const { data } = await API.post(`/syllabus`, payload); // payload can be array
  return data;
};

export const updateMasterSyllabus = async (id, payload) => {
  const { data } = await API.put(`/syllabus/topic/${id}`, payload);
  return data;
};

export const deleteMasterSyllabus = async (id) => {
  const { data } = await API.delete(`/syllabus/topic/${id}`);
  return data;
};