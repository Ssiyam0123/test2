
import { API } from "./axios.js";

// Fetch dashboard stats
export const fetchDashboardStats = async () => {
  const { data } = await API.get("/dashboard/stats");
  return data;
};

// Fetch dashboard stats with filters
export const fetchDashboardStatsWithFilters = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const { data } = await API.get(`/dashboard/stats?${params}`);
  return data;
};