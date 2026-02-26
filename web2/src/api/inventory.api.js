import { API } from "./axios";

// ==============================
// INVENTORY FETCH ENDPOINTS
// ==============================

// Get current stock levels for a specific branch
export const fetchBranchInventory = async (branchId) => {
  const { data } = await API.get(`/inventory/${branchId}`);
  return data;
};

// Get the ledger/history of all IN and OUT transactions for a branch
export const fetchBranchTransactions = async (branchId) => {
  const { data } = await API.get(`/inventory/${branchId}/transactions`);
  return data;
};

// ==============================
// INVENTORY MUTATION ENDPOINTS
// ==============================

// Staff logs a new purchase (Stock IN)
export const addStockPurchase = async (branchId, purchaseData) => {
  const { data } = await API.post(`/inventory/${branchId}/purchase`, purchaseData);
  return data;
};

// Deduct items based on an instructor's class requisition (Stock OUT)
export const deductClassRequisition = async (branchId, classId, itemsPayload) => {
  // itemsPayload expects: { items: [{ name: "Chicken", qty: 2, unit: "kg" }] }
  const { data } = await API.post(`/inventory/${branchId}/classes/${classId}/deduct`, itemsPayload);
  return data;
};