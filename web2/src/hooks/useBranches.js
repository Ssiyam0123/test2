import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  fetchAllBranches,
  fetchBranchById,
  createBranch,
  updateBranch,
  toggleBranchStatus,
  deleteBranch,
} from "../api/branch.api";

// 1. Fetch All Branches
export const useBranches = (filters = {}) => {
  return useQuery({
    queryKey: ["branches", filters],
    queryFn: () => fetchAllBranches(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes (branches rarely change)
  });
};

// 2. Fetch Single Branch
export const useBranch = (id) => {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => fetchBranchById(id),
    enabled: !!id, // Only run if ID exists
  });
};

// 3. Create Branch
export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBranch,
    onSuccess: (data) => {
      toast.success(data.message || "Branch established successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to create branch";
      toast.error(errorMessage);
    },
  });
};

// 4. Update Branch
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBranch,
    onSuccess: (data) => {
      toast.success(data.message || "Branch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", data.data?._id] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Failed to update branch";
      toast.error(errorMessage);
    },
  });
};

// 5. Toggle Branch Status
export const useToggleBranchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleBranchStatus,
    onSuccess: (data) => {
      toast.success(data.message || "Branch status updated.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", data.data?._id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    },
  });
};

// 6. Delete Branch
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: (data) => {
      toast.success(data.message || "Branch deleted permanently.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete branch");
    },
  });
};