import { API } from "./axios";

// ==========================================
// BATCH ENDPOINTS (/api/batches)
// ==========================================

export const fetchBatches = async (filters = {}) => {
  // Merge default status with any incoming filters (like branch)
  const params = new URLSearchParams({ status: "all", ...filters });
  const { data } = await API.get(`/batches?${params}`);
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