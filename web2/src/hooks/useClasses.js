import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as ClassAPI from "../api/class.api";

export const useBatchClasses = (batchId) => {
  return useQuery({
    queryKey: ["batchClasses", batchId],
    queryFn: () => ClassAPI.fetchBatchClasses(batchId),
    enabled: !!batchId,
  });
};

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
    onSuccess: () => {
      toast.success("Calendar populated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] }); 
    },
    onError: (error) => toast.error(error.response?.data?.message || "Scheduling failed"),
  });
};

export const useUpdateClassContent = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ClassAPI.updateClassContent,
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
    mutationFn: ClassAPI.scheduleClass,
    onSuccess: () => {
      toast.success("Class Schedule Updated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
      queryClient.invalidateQueries({ queryKey: ["daily-schedule"] }); 
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to schedule class"),
  });
};

export const useUpdateClassAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ClassAPI.updateClassAttendance,
    onSuccess: (_, variables) => {
      toast.success("Class attendance updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["batchClasses"] }); 
      if (variables.batchId) {
        queryClient.invalidateQueries({ queryKey: ["batchClasses", variables.batchId] }); 
      }
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update"),
  });
};