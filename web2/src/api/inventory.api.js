import { API } from "./axios";

// ==============================
// INVENTORY ENDPOINTS
// ==============================

export const fetchInventoryAPI = async (branchId) => {
  const { data } = await API.get(`/inventory`, { params: { branch: branchId } });
  return data;
};

export const fetchBranchTransactions = async (branchId) => {
  const { data } = await API.get(`/inventory/transactions`, { params: { branch: branchId } });
  return data;
};

export const addStockPurchase = async (branchId, purchaseData) => {
  const { data } = await API.post(`/inventory/purchase`, purchaseData, { params: { branch: branchId } });
  return data;
};