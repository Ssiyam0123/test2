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
    onSuccess: async (res) => { // <-- MUST BE ASYNC
      toast.success(res.message || "Payment collected successfully!");
      
      // WAIT for the fresh data to download before letting the UI proceed
      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      
      // Force the background Student Directory table to update its "Balance" column
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
    onSuccess: async () => { // <-- MUST BE ASYNC
      toast.success("Scholarship/Discount applied!");
      
      // CRITICAL FIX: The `await` pauses the modal from switching tabs until the new math is ready
      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      
      // Force the background Student Directory table to update its "Balance" column
      await queryClient.invalidateQueries({ queryKey: ["students"] }); 
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update discount.");
    },
  });
};


