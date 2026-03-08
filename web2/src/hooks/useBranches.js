import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import * as BranchAPI from "../api/branch.api";

export const useBranches = (filters = {}) => {
  return useQuery({
    queryKey: ["branches", filters],
    queryFn: () => BranchAPI.fetchAllBranches(filters),
    // 🚀 সরাসরি ডাটা রিটার্ন (API ফাইল যদি data.data পাঠায়, এটা অলরেডি ক্লিন থাকবে)
  });
};

export const useBranch = (id) => {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => BranchAPI.fetchBranchById(id),
    enabled: !!id, 
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BranchAPI.createBranch,
    onSuccess: () => {
      toast.success("New branch established successfully!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create branch"),
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BranchAPI.updateBranch,
    onSuccess: (_, variables) => {
      toast.success("Branch configuration updated!");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Update failed"),
  });
};

export const useToggleBranchStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BranchAPI.toggleBranchStatus,
    onSuccess: (_, id) => {
      toast.success("Branch status synchronized.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BranchAPI.deleteBranch,
    onSuccess: () => {
      toast.success("Branch removed from network.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};