import { API } from "./axios";

export const fetchAllBranches = async (params = {}) => {
  const { data } = await API.get("/branches/all", { params });
  return data.data;
};

export const fetchBranchById = async (id) => {
  const { data } = await API.get(`/branches/${id}`);
  return data.data;
};

export const createBranch = async (branchData) => {
  const { data } = await API.post("/branches/create", branchData);
  return data.data;
};

export const updateBranch = async ({ id, formData }) => {
  const { data } = await API.put(`/branches/${id}`, formData);
  return data.data;
};

export const toggleBranchStatus = async (id) => {
  const { data } = await API.patch(`/branches/${id}/toggle`);
  return data.data;
};

export const deleteBranch = async (id) => {
  const { data } = await API.delete(`/branches/${id}`);
  return data.data;
};