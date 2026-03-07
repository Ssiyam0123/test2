import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { API } from "../api/axios";
import { fetchStudentFinanceAPI } from "../api/finance.api";

export const useHolidays = () => {
  return useQuery({
    queryKey: ["holidays"],
    queryFn: () => API.get("/holidays"),
  });
};

export const useAddHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => API.post("/holidays", data),
    onSuccess: (res) => {
      toast.success(res.message || "Holiday added!");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add holiday"),
  });
};

export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => API.delete(`/holidays/${id}`),
    onSuccess: (res) => {
      toast.success(res.message || "Holiday removed!");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: (err) => toast.error("Failed to delete holiday"),
  });
};



export const useStudentFinance = (studentId) => {
  return useQuery({
    queryKey: ["student-finance", studentId],
    queryFn: () => fetchStudentFinanceAPI(studentId),
    enabled: !!studentId,
  });
};