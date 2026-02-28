import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as ClassAPI from "../api/class.api";

// ==============================
// FETCH QUERIES (GET)
// ==============================

export const useBatchClasses = (batchId) => {
  return useQuery({
    queryKey: ["batchClasses", batchId],
    queryFn: () => ClassAPI.fetchBatchClasses(batchId),
    enabled: !!batchId,
  });
};

// ==============================
// MUTATION QUERIES (POST/PUT/DELETE)
// ==============================

export const useAddSyllabusItems = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (syllabusData) => ClassAPI.addSyllabusItems(batchId, syllabusData),
    onSuccess: () => {
      toast.success("Items added to Syllabus!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add items"),
  });
};

export const useAutoSchedule = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ClassAPI.autoScheduleBatch(batchId),
    onSuccess: (data) => {
      toast.success(data.message || "Calendar populated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] }); // Important for daily tabs
    },
    onError: (error) => toast.error(error.response?.data?.message || "Scheduling failed"),
  });
};

export const useUpdateClassContent = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, ...updateData }) => ClassAPI.updateClassContent(classId, updateData),
    onSuccess: () => {
      toast.success("Class updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
  });
};

export const useDeleteClass = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ClassAPI.deleteClassContent,
    onSuccess: () => {
      toast.success("Class removed successfully");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete class"),
  });
};

export const useScheduleClass = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, date_scheduled }) => ClassAPI.scheduleClass(classId, date_scheduled),
    onSuccess: () => {
      toast.success("Class Schedule Updated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] }); // Forces calendar refresh
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to schedule class"),
  });
};

export const useUpdateClassAttendance = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, payload }) => ClassAPI.updateClassAttendance(classId, payload),
    onSuccess: async () => {
      // Invalidate everything this report touches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] }),
        queryClient.invalidateQueries({ queryKey: ["batch", batchId] }), 
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
      toast.success("Class report saved successfully!");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to submit class report"),
  });
};