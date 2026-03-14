import { API } from "./axios";


/**
 * 💸 সাধারণ খরচের তালিকা নিয়ে আসা (Filterable)
 */
export const fetchExpenses = async (filters = {}) => {
  const { data } = await API.get("/expenses", { params: filters });
  return data.data;
};

/**
 * 📊 ক্লাস অনুযায়ী খরচের সামারি নিয়ে আসা
 */
export const fetchExpenseByClass = async (branchId) => {
  if (!branchId) return [];
  const { data } = await API.get(`/expenses/by-class/${branchId}`);
  return data.data;
};