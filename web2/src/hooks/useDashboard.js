import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as DashboardAPI from "../api/dashboard.api.js";
import toast from "react-hot-toast";

export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => DashboardAPI.fetchDashboardStatsWithFilters(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useBranchStats = (branchId) => {
  return useQuery({
    queryKey: ["dashboard", "branch", branchId],
    queryFn: () => DashboardAPI.fetchBranchStats(branchId),
    enabled: !!branchId, 
    staleTime: 5 * 60 * 1000,
    onError: (error) => toast.error(`Failed to load branch data: ${error.message}`),
  });
};

export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();
  return {
    prefetchDashboard: () => {
      queryClient.prefetchQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: DashboardAPI.fetchDashboardStats,
        staleTime: 5 * 60 * 1000,
      });
    }
  };
};

export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  return {
    refreshDashboard: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        toast.success("Dashboard data refreshed!");
      } catch (error) {
        toast.error("Failed to refresh dashboard data");
      }
    },
    refreshWithNewFilters: async (filters) => {
      try {
        await queryClient.invalidateQueries({ queryKey: ["dashboard", "stats", filters] });
      } catch (error) {
        toast.error("Failed to refresh with filters");
      }
    }
  };
};