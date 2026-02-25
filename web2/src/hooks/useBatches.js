import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as BatchAPI from "../api/batch.api";

// ==============================
// FETCH QUERIES (GET)
// ==============================

export const useActiveBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: BatchAPI.fetchBatches,
  });
};

export const useBatchesByStatus = (status = "all") => {
  return useQuery({
    queryKey: ["batches", status],
    queryFn: () => BatchAPI.fetchBatchesByStatus(status),
  });
};

export const useBatchById = (id) => {
  return useQuery({
    queryKey: ["batch", id],
    queryFn: () => BatchAPI.fetchBatchById(id),
    enabled: !!id, // Only run if ID exists
  });
};

export const useBatchClasses = (batchId) => {
  return useQuery({
    queryKey: ["batchClasses", batchId],
    queryFn: () => (batchId ? BatchAPI.fetchBatchClasses(batchId) : { data: [] }),
    enabled: !!batchId,
  });
};

// ==============================
// BATCH MUTATIONS (POST/PUT/DELETE)
// ==============================

export const useAddBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BatchAPI.createBatch,
    onSuccess: () => {
      toast.success("Batch created!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => BatchAPI.updateBatch(id, updateData),
    onSuccess: () => {
      toast.success("Batch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BatchAPI.deleteBatch,
    onSuccess: () => {
      toast.success("Batch deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => {
      toast.error("Failed to delete batch");
    },
  });
};

export const useAutoSchedule = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => BatchAPI.autoScheduleBatch(batchId),
    onSuccess: (data) => {
      toast.success(data.message || "Calendar populated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Scheduling failed");
    },
  });
};

// ==============================
// CLASS/SYLLABUS MUTATIONS
// ==============================

export const useAddSyllabusItem = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (syllabusData) => BatchAPI.addSyllabusItem(batchId, syllabusData),
    onSuccess: () => {
      toast.success("Added to Syllabus!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
  });
};

export const useUpdateClassContent = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, ...updateData }) => BatchAPI.updateClassContent(classId, updateData),
    onSuccess: () => {
      toast.success("Class updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
  });
};

export const useDeleteClass = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: BatchAPI.deleteClassContent,
    onSuccess: () => {
      toast.success("Class removed successfully");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete class");
    },
  });
};

export const useScheduleClass = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classContentId, date_scheduled }) => BatchAPI.scheduleClass(classContentId, date_scheduled),
    onSuccess: () => {
      toast.success("Topic Scheduled!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
  });
};

// ==============================
// ATTENDANCE MUTATIONS
// ==============================

export const useUpdateClassAttendance = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, attendanceRecords }) => BatchAPI.updateClassAttendance(classId, attendanceRecords),
    onSuccess: () => {
      toast.success("Attendance records updated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to save attendance.");
    },
  });
};

// Legacy endpoint wrapper (from your original code)
export const useUpdateAttendance = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attendanceData) => BatchAPI.updateBatchAttendance(batchId, attendanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });  
    },
  });
};