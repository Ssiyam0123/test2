import { API } from "./axios";

// ==============================
// INVENTORY ENDPOINTS
// ==============================

export const fetchBranchInventory = async (branchId) => {
  const { data } = await API.get(`/inventory/${branchId}`);
  return data;
};

export const fetchBranchTransactions = async (branchId) => {
  const { data } = await API.get(`/inventory/${branchId}/transactions`);
  return data;
};

export const addStockPurchase = async (branchId, purchaseData) => {
  const { data } = await API.post(`/inventory/${branchId}/purchase`, purchaseData);
  return data;
};