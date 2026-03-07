import { API } from "./axios";


export const fetchStudentFinanceAPI = async (studentId) => {
  const { data } = await API.get(`/finance/student/${studentId}`);
  return data.data; 
};


export const downloadReceiptAPI = async (txnId) => {
  const response = await API.get(`/finance/receipt/${txnId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};