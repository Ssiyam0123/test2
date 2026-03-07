import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  getClassRequisitionAPI, 
  submitRequisitionAPI, 
  approveRequisitionAPI, 
  rejectRequisitionAPI, 
  fetchAllRequisitionsAPI
} from "../api/requisition.api.js";

export const useClassRequisition = (classId) => {
  return useQuery({
    queryKey: ["requisition", classId],
    queryFn: () => getClassRequisitionAPI(classId),
    enabled: !!classId, 
  });
};

export const useSubmitRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitRequisitionAPI,
    onSuccess: (_, variables) => {
      toast.success("Requisition submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["requisition", variables.class_content] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to submit requisition"),
  });
};

export const useReviewRequisition = (reqId, classId) => {
  const queryClient = useQueryClient();
  
  const approve = useMutation({
    mutationFn: (payload) => approveRequisitionAPI({ reqId, payload }),
    onSuccess: () => {
      toast.success("Requisition Approved & Stock Deducted!");
      queryClient.invalidateQueries({ queryKey: ["requisition", classId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve"),
  });

  const reject = useMutation({
    mutationFn: (admin_note) => rejectRequisitionAPI({ reqId, admin_note }),
    onSuccess: () => {
      toast.error("Requisition Rejected!");
      queryClient.invalidateQueries({ queryKey: ["requisition", classId] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject"),
  });

  return { approve, reject };
};


// 🚀 Fetch all pending requisitions for the dashboard
export const useAllRequisitions = (branchId) => {
  return useQuery({
    queryKey: ["all-requisitions", branchId],
    // 🚀 FIX: এখানে () => দিয়ে কল করতে হবে, নাহলে React Query তার নিজের অবজেক্ট পাঠিয়ে দিবে!
    queryFn: () => fetchAllRequisitionsAPI(branchId),
    enabled: !!branchId, // branchId না আসা পর্যন্ত API কল হবে না
  });
};