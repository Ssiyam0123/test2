import { API } from "./axios";

// ==============================
// REQUISITION ENDPOINTS
// ==============================

// ১. শেফ নতুন রিকোয়েস্ট পাঠাবে বা আপডেট করবে
export const submitRequisition = async (payload) => {
  const { data } = await API.post("/requisitions/create", payload);
  return data;
};

// ২. ম্যানেজার ড্যাশবোর্ডে সব রিকোয়েস্ট (Pending & History) দেখবে
export const fetchPendingRequisitions = async (branchId) => {
  const { data } = await API.get(`/requisitions/branch/${branchId}/pending`);
  return data;
};

// ৩. ম্যানেজার রিকোয়েস্ট Approve করবে
export const fulfillRequisition = async (branchId, reqId, payload) => {
  const { data } = await API.post(`/requisitions/${branchId}/fulfill/${reqId}`, payload);
  return data;
};

// ৪. ম্যানেজার রিকোয়েস্ট Reject করবে
export const rejectRequisition = async (branchId, reqId) => {
  const { data } = await API.patch(`/requisitions/${branchId}/reject/${reqId}`);
  return data;
};