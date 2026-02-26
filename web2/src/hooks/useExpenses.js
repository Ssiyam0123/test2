import { useQuery } from "@tanstack/react-query";
import { API } from "../api/axios";

// Fetch function
const fetchExpenses = async (filters) => {
  const params = new URLSearchParams();
  
  // Attach whichever ID was passed in
  if (filters?.branchId) params.append("branchId", filters.branchId);
  if (filters?.batchId) params.append("batchId", filters.batchId);
  if (filters?.classId) params.append("classId", filters.classId);

  const response = await API.get(`/expenses?${params.toString()}`);
  return response.data;
};

// React Query Hook
export const useExpenses = (filters) => {
  return useQuery({
    // The query key dynamically updates based on the filters, caching them separately
    queryKey: ["expenses", filters],
    queryFn: () => fetchExpenses(filters),
    // Only run the query if we actually have an ID to search for
    enabled: !!(filters?.branchId || filters?.batchId || filters?.classId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};