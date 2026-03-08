import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as FinanceAPI from "../api/finance.api";
import toast from "react-hot-toast";

export const useCampusFees = (filters = {}) => {
  return useQuery({
    queryKey: ["campus-fees", filters],
    queryFn: () => FinanceAPI.getCampusFees(filters),
  });
};

export const useStudentFinance = (studentId) => {
  return useQuery({
    queryKey: ["student-finance", studentId],
    queryFn: () => FinanceAPI.getStudentFinance(studentId),
    enabled: !!studentId,
  });
};

export const useCollectPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FinanceAPI.collectPayment,
    onSuccess: async () => {
      toast.success("Payment collected successfully!");
      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to process payment."),
  });
};

export const useUpdateFeeDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FinanceAPI.updateFeeDiscount,
    onSuccess: async () => {
      toast.success("Scholarship/Discount applied!");
      await queryClient.invalidateQueries({ queryKey: ["student-finance"] });
      await queryClient.invalidateQueries({ queryKey: ["campus-fees"] });
      await queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update discount."),
  });
};

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: FinanceAPI.downloadReceiptAPI,
    onSuccess: (blob, txnId) => {
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt_${txnId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); 
    },
    onError: () => toast.error("Failed to download receipt"),
  });
};

export const useSendSmsReminder = () => {
  return useMutation({
    mutationFn: FinanceAPI.sendSMSReminderAPI,
    onSuccess: () => toast.success("SMS reminder sent successfully!"),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send SMS"),
  });
};