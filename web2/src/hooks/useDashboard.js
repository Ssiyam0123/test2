// hooks/useDashboard.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchDashboardStats, fetchDashboardStatsWithFilters } from "../api/dashboard.api.js";

export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => fetchDashboardStatsWithFilters(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      toast.error(`Failed to load dashboard data: ${error.message}`);
    },
  });
};

export const usePrefetchDashboard = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchDashboard: () => {
      queryClient.prefetchQuery({
        queryKey: ["dashboard", "stats"],
        queryFn: fetchDashboardStats,
        staleTime: 5 * 60 * 1000,
      });
    }
  };
};

// Custom hook for refreshing dashboard data
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
        await queryClient.invalidateQueries({ 
          queryKey: ["dashboard", "stats", filters] 
        });
      } catch (error) {
        toast.error("Failed to refresh with filters");
      }
    }
  };
};