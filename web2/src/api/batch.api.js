import { API } from "./axios";

export const fetchBatches = async (filters = {}) => {
  const params = new URLSearchParams({ status: "all", ...filters });
  const { data } = await API.get(`/batches?${params}`);
  return data.data;
};

export const fetchBatchById = async (id) => {
  const { data } = await API.get(`/batches/${id}`);
  return data.data;
};

export const createBatch = async (batchData) => {
  const { data } = await API.post("/batches", batchData);
  return data.data;
};

export const updateBatch = async ({ id, formData }) => {
  const { data } = await API.put(`/batches/${id}`, formData);
  return data.data;
};

export const deleteBatch = async (id) => {
  const { data } = await API.delete(`/batches/${id}`);
  return data.data;
};