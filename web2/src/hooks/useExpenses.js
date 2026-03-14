import { useQuery } from "@tanstack/react-query";
import { API } from "../api/axios";
import { fetchExpenseByClass } from "../api/expense.api";

// Fetch function
const fetchExpenses = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters?.branchId) params.append("branchId", filters.branchId);
  if (filters?.batchId) params.append("batchId", filters.batchId);
  if (filters?.classId) params.append("classId", filters.classId);

  const { data } = await API.get(`/expenses?${params.toString()}`);
  return data.data; // 🚀 FIXED: Now it returns the raw Array directly!
};

// React Query Hook
export const useExpenses = (filters) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => fetchExpenses(filters),
    enabled: !!(filters?.branchId || filters?.batchId || filters?.classId),
    staleTime: 5 * 60 * 1000, 
  });
};




export const useExpenseByClass = (branchId) => {
  return useQuery({
    queryKey: ["expenses-by-class", branchId],
    queryFn: () => fetchExpenseByClass(branchId),
    enabled: !!branchId, 
    staleTime: 5 * 60 * 1000,
  });
};
