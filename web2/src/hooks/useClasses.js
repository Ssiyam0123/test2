import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as ClassAPI from "../api/class.api";
import { API } from "../api/axios";

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

export const useUpdateClassAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classId, batchId, ...payload }) => {
      if (!classId) throw new Error("Class ID is missing");
      const response = await API.put(`/classes/${classId}/attendance`, payload);
      return { data: response.data, batchId }; 
    },
    onSuccess: ({ batchId }) => {
      toast.success("Class updated successfully!");
      
      // 🚀 FIXED: Refresh both specific and general cache to force UI update
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["batchClasses"] }); // This will refresh ALL batch classes
      if (batchId) {
        queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] }); 
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Failed to update");
    }
  });
};