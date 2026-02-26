import { API } from "./axios.js";

// Global stats (existing)
export const fetchDashboardStats = async () => {
  const { data } = await API.get("/dashboard/stats");
  return data;
};

// Global stats with filters (existing)
export const fetchDashboardStatsWithFilters = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const { data } = await API.get(`/dashboard/stats?${params}`);
  return data;
};

// NEW: Fetch specific branch analytics
export const fetchBranchStats = async (branchId) => {
  const { data } = await API.get(`/dashboard/branch-stats/${branchId}`);
  return data;
};