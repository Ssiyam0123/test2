import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export const useHolidays = () => {
  return useQuery({
    queryKey: ["holidays"],
    queryFn: async () => {
      const { data } = await API.get("/holidays");
      return data.data; // 🚀 FIXED: Returns raw Array!
    },
  });
};

export const useAddHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (holidayData) => {
      const { data } = await API.post("/holidays", holidayData);
      return data.data; // 🚀 FIXED
    },
    onSuccess: () => {
      toast.success("Holiday added!");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add holiday"),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await API.delete(`/holidays/${id}`);
      return data.data; // 🚀 FIXED
    },
    onSuccess: () => {
      toast.success("Holiday removed!");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: () => toast.error("Failed to delete holiday"),
  });
};