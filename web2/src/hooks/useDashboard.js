



import { useQuery,useQueryClient } from "@tanstack/react-query";
import { 
  fetchDashboardStats, 
  fetchDashboardStatsWithFilters,
  fetchBranchStats 
} from "../api/dashboard.api.js";
import toast from "react-hot-toast";

// Existing global hook
export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: ["dashboard", "stats", filters],
    queryFn: () => fetchDashboardStatsWithFilters(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// NEW: Hook for Branch Specific Analytics
export const useBranchStats = (branchId) => {
  return useQuery({
    queryKey: ["dashboard", "branch", branchId],
    queryFn: () => fetchBranchStats(branchId),
    enabled: !!branchId, // Only run if branchId exists
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      toast.error(`Failed to load branch data: ${error.message}`);
    },
  });
};

// ... keep your usePrefetchDashboard and useRefreshDashboard hooks as they were



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