import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as BatchAPI from "../api/batch.api";

// ==============================
// FETCH QUERIES (GET)
// ==============================

export const useBatches = (filters = {}) => {
  return useQuery({
    queryKey: ["batches", filters],
    queryFn: () => BatchAPI.fetchBatches(filters), // <-- FIXED THIS LINE
  });
};

export const useBatchById = (id) => {
  return useQuery({
    queryKey: ["batch", id],
    queryFn: () => BatchAPI.fetchBatchById(id),
    enabled: !!id,
  });
};

// ==============================
// MUTATION QUERIES (POST/PUT/DELETE)
// ==============================

export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BatchAPI.createBatch,
    onSuccess: () => {
      toast.success("Batch created successfully!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create batch"),
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => BatchAPI.updateBatch(id, updateData),
    onSuccess: (_, variables) => {
      toast.success("Batch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Update failed"),
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BatchAPI.deleteBatch,
    onSuccess: () => {
      toast.success("Batch and curriculum deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => toast.error("Failed to delete batch"),
  });
};