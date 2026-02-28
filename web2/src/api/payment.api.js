import { API } from "./axios";

export const getCampusFees = async (filters) => {
  const { data } = await API.get("/finance/fees", { params: filters });
  return data.data;
};

export const getStudentFinance = async (studentId) => {
  const { data } = await API.get(`/finance/student/${studentId}`);
  return data.data;
};

export const collectPayment = async (payload) => {
  const { data } = await API.post("/finance/pay", payload);
  return data;
};

export const updateFeeDiscount = async ({ feeId, discount }) => {
  const { data } = await API.patch(`/finance/fee/${feeId}/discount`, { discount });
  return data;
};