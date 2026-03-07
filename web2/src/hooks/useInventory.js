import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as InventoryAPI from "../api/inventory.api";

// 📦 Fetch Current Stock
export const useInventory = (branchId) => {
  return useQuery({
    queryKey: ["inventory", branchId],
    queryFn: () => InventoryAPI.fetchInventoryAPI(branchId),
    enabled: !!branchId,
  });
};

// 📜 Fetch Stock History/Transactions
export const useBranchTransactions = (branchId) => {
  return useQuery({
    queryKey: ["inventory-transactions", branchId],
    queryFn: () => InventoryAPI.fetchBranchTransactions(branchId),
    enabled: !!branchId,
  });
};

// 🛒 Add New Stock Purchase
export const useAddStockPurchase = (branchId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (purchaseData) => InventoryAPI.addStockPurchase(branchId, purchaseData),
    onSuccess: async () => {
      // 🚀 Sync everything when new stock arrives!
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["inventory-transactions", branchId] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }), 
      ]);
      toast.success("Purchase logged to inventory and ledger!");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to log purchase.");
    }
  });
};