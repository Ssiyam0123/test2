import { API } from "./axios.js";

export const fetchDashboardStats = async () => {
  const { data } = await API.get("/dashboard/stats");
  return data.data;
};

export const fetchDashboardStatsWithFilters = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const { data } = await API.get(`/dashboard/stats?${params}`);
  return data.data;
};

export const fetchBranchStats = async (branchId) => {
  const { data } = await API.get(`/dashboard/branch-stats/${branchId}`);
  return data.data;
};