import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as SyllabusAPI from "../api/masterSyllabus.api";

// ১. সব টপিক ফেচ করার জন্য
export const useMasterTopics = (params = {}) => {
  return useQuery({
    queryKey: ["master-topics", params],
    queryFn: () => SyllabusAPI.fetchAllMasterTopics(params),
  });
};

// ২. একটি নির্দিষ্ট টপিক এডিট করার জন্য ডাটা আনা
export const useMasterSyllabusDetails = (id, options = {}) => {
  return useQuery({
    queryKey: ["syllabus-topic", id],
    queryFn: () => SyllabusAPI.fetchSyllabusTopic(id),
    enabled: !!id && options.enabled !== false,
  });
};

// ৩. নতুন টপিক অ্যাড করার জন্য
export const useAddMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => SyllabusAPI.addMasterSyllabus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add syllabus.");
    }
  });
};

// 🚀 ৪. টপিক আপডেট করার জন্য (যেটা তোর এরর দিচ্ছিল)
export const useUpdateMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => SyllabusAPI.updateMasterSyllabus(id, payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["syllabus-topic", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
      toast.success("Topic updated successfully!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Update failed.");
    }
  });
};

// ৫. টপিক ডিলিট করার জন্য
export const useDeleteMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => SyllabusAPI.deleteMasterSyllabus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
      toast.success("Topic removed from library.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Delete failed.");
    }
  });
};