import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as PaymentAPI from "../api/payment.api";
import toast from "react-hot-toast";
import { downloadReceiptAPI } from "../api/finance.api";
// ...
export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: downloadReceiptAPI,
    onSuccess: (blob, txnId) => {
      // ফাইলটা ব্রাউজারে সেভ করার লজিক
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt_${txnId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    onError: () => toast.error("Failed to download receipt"),
  });
};
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
