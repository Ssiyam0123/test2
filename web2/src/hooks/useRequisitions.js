import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as RequisitionAPI from "../api/requisition.api";

// 🚀 FETCH: Get Pending/History Requisitions
export const usePendingRequisitions = (branchId) => {
  return useQuery({
    queryKey: ["pending-requisitions", branchId],
    queryFn: () => RequisitionAPI.fetchPendingRequisitions(branchId),
    enabled: !!branchId, 
  });
};

// 🚀 MUTATION: Submit Requisition (Chef/Instructor)
export const useSubmitRequisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => RequisitionAPI.submitRequisition(payload),
    onSuccess: (res, variables) => {
      toast.success("Bazar requisition sent to Inventory!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", variables.batch] });
      queryClient.invalidateQueries({ queryKey: ["pending-requisitions", variables.branch] }); 
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to send requisition");
    }
  });
};

// 🚀 MUTATION: Approve Requisition (Inventory Manager)
export const useFulfillRequisition = (branchId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reqId, actual_cost }) => {
      return RequisitionAPI.fulfillRequisition(branchId, reqId, { actual_cost });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-transactions", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["pending-requisitions", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] })
      ]);
      toast.success("Approved! Stock updated.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to approve.")
  });
};

// 🚀 MUTATION: Reject Requisition (Inventory Manager)
export const useRejectRequisition = (branchId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reqId) => {
      return RequisitionAPI.rejectRequisition(branchId, reqId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-requisitions", branchId] });
      toast.success("Requisition rejected.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to reject.")
  });
};