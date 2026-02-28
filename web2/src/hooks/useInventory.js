import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as InventoryAPI from "../api/inventory.api";

// ==============================
// FETCH QUERIES (GET)
// ==============================

export const useBranchInventory = (branchId) => {
  return useQuery({
    queryKey: ["inventory", branchId],
    queryFn: () => InventoryAPI.fetchBranchInventory(branchId),
    enabled: !!branchId, // Only run if a branch ID is provided
  });
};

export const useBranchTransactions = (branchId) => {
  return useQuery({
    queryKey: ["inventory-transactions", branchId],
    queryFn: () => InventoryAPI.fetchBranchTransactions(branchId),
    enabled: !!branchId,
  });
};

// ==============================
// MUTATION QUERIES (POST)
// ==============================

export const useAddStockPurchase = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseData) => InventoryAPI.addStockPurchase(branchId, purchaseData),
    onSuccess: async () => {
      // 1. Refresh the pantry stock levels
      // 2. Refresh the transaction ledger
      // 3. Refresh the global expenses (because this purchase cost money!)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-transactions", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }), 
      ]);
      
      toast.success("Purchase logged to inventory and ledger!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to log purchase.");
      console.error("Inventory Purchase Error:", error);
    }
  });
};

// frontend/hooks/useInventory.js

export const useDeductClassRequisition = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    // Notice how we pass classId inside an object here now!
    mutationFn: ({ classId, itemsPayload }) => 
      InventoryAPI.deductClassRequisition(branchId, classId, itemsPayload),
    
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-transactions", branchId] })
        // You should also invalidate the pending requisitions list here once you build it!
      ]);
      toast.success("Requisition approved and stock deducted.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to deduct inventory.");
      console.error("Inventory Deduction Error:", error);
    }
  });
};