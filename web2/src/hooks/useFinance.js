import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as PaymentAPI from "../api/payment.api";
import toast from "react-hot-toast";

export const useCampusFees = (filters = {}) => {
  return useQuery({
    queryKey: ["campus-fees", filters],
    queryFn: () => PaymentAPI.getCampusFees(filters),
  });
};

export const useStudentFinance = (studentId) => {
  return useQuery({
    queryKey: ["student-finance", studentId],
    queryFn: () => PaymentAPI.getStudentFinance(studentId),
    enabled: !!studentId,
  });
};

// IN web2/src/hooks/useFinance.js

export const useCollectPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PaymentAPI.collectPayment,
    onSuccess: async (res) => { 
      toast.success(res.message || "Payment collected successfully!");
      
      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      
      await queryClient.invalidateQueries({ queryKey: ["students"] }); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to process payment.");
    },
  });
};

export const useUpdateFeeDiscount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PaymentAPI.updateFeeDiscount,
    onSuccess: async () => { 
      toast.success("Scholarship/Discount applied!");
      

      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      
      await queryClient.invalidateQueries({ queryKey: ["students"] }); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update discount.");
    },
  });
};


