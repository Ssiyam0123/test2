import { API } from "./axios";

// ==============================
// REQUISITION ENDPOINTS
// ==============================

export const getClassRequisitionAPI = async (classId) => {
  const { data } = await API.get(`/requisitions/class/${classId}`);
  return data;
};

export const submitRequisitionAPI = async (payload) => {
  const { data } = await API.post("/requisitions", payload);
  return data;
};

export const approveRequisitionAPI = async ({ reqId, payload }) => {
  const { data } = await API.put(`/requisitions/${reqId}/approve`, payload);
  return data;
};

export const rejectRequisitionAPI = async ({ reqId, admin_note }) => {
  const { data } = await API.put(`/requisitions/${reqId}/reject`, { admin_note });
  return data;
};

export const fetchAllRequisitionsAPI = async (branchId) => {
  const { data } = await API.get("/requisitions", { params: { branch: branchId } });
  return data;
};