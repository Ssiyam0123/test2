import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as SyllabusAPI from "../api/masterSyllabus.api";

export const useMasterTopics = (params = {}) => {
  return useQuery({
    queryKey: ["master-topics", params],
    queryFn: () => SyllabusAPI.fetchAllMasterTopics(params),
  });
};

export const useMasterSyllabusDetails = (id, options = {}) => {
  return useQuery({
    queryKey: ["syllabus-topic", id],
    queryFn: () => SyllabusAPI.fetchSyllabusTopic(id),
    enabled: !!id && options.enabled !== false,
  });
};

export const useAddMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: SyllabusAPI.addMasterSyllabus,
    onSuccess: () => {
      toast.success("Topic added successfully!");
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to add syllabus.")
  });
};

export const useUpdateMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: SyllabusAPI.updateMasterSyllabus,
    onSuccess: (_, variables) => {
      toast.success("Topic updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["syllabus-topic", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Update failed.")
  });
};

export const useDeleteMasterSyllabus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: SyllabusAPI.deleteMasterSyllabus,
    onSuccess: () => {
      toast.success("Topic removed from library.");
      queryClient.invalidateQueries({ queryKey: ["master-topics"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Delete failed.")
  });
};