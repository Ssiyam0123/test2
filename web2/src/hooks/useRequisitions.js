import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as RequisitionAPI from "../api/requisition.api.js";

export const useClassRequisition = (classId) => {
  return useQuery({
    queryKey: ["requisition", classId],
    queryFn: () => RequisitionAPI.getClassRequisitionAPI(classId),
    enabled: !!classId, 
  });
};

export const useAllRequisitions = (branchId) => {
  return useQuery({
    queryKey: ["all-requisitions", branchId],
    queryFn: () => RequisitionAPI.fetchAllRequisitionsAPI(branchId),
    enabled: !!branchId, 
  });
};

export const useSubmitRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RequisitionAPI.submitRequisitionAPI,
    onSuccess: (_, variables) => {
      toast.success("Requisition submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["requisition", variables.class_content] });
      queryClient.invalidateQueries({ queryKey: ["all-requisitions"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to submit requisition"),
  });
};

// 🚀 Optimized for Lists: Approve Requisition
export const useApproveRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // কল করার সময় অবজেক্ট আকারে { id, payload } পাঠাবি
    mutationFn: ({ id, payload }) => RequisitionAPI.approveRequisitionAPI({ reqId: id, payload }),
    onSuccess: () => {
      toast.success("Requisition Approved & Stock Deducted!");
      queryClient.invalidateQueries({ queryKey: ["all-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // স্টক আপডেট হয়েছে তাই ইনভেন্টরি রিফ্রেশ
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve"),
  });
};

// 🚀 Optimized for Lists: Reject Requisition
export const useRejectRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin_note }) => RequisitionAPI.rejectRequisitionAPI({ reqId: id, admin_note }),
    onSuccess: () => {
      toast.error("Requisition Rejected!"); // Rejected মেসেজ তাই লাল টোস্ট (optional)
      queryClient.invalidateQueries({ queryKey: ["all-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["requisition"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject"),
  });
};