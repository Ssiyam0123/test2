import { API } from "./axios";

// ==========================================
// BRANCH API CALLS
// ==========================================

/**
 * Fetch all branches (Supports search and status filtering)
 * @param {Object} params - { search: string, is_active: boolean }
 */
export const fetchAllBranches = async (params = {}) => {
  const { data } = await API.get("/branches/all", { params });
  return data;
};

/**
 * Fetch a single branch by ID
 * @param {String} id - Branch ID
 */
export const fetchBranchById = async (id) => {
  const { data } = await API.get(`/branches/${id}`);
  return data;
};

/**
 * Create a new branch (Super Admin only)
 * @param {Object} branchData - The branch form payload
 */
export const createBranch = async (branchData) => {
  const { data } = await API.post("/branches/create", branchData);
  return data;
};

/**
 * Update an existing branch (Super Admin only)
 * @param {Object} param0 - { id: Branch ID, formData: Updated data }
 */
export const updateBranch = async ({ id, formData }) => {
  const { data } = await API.put(`/branches/${id}`, formData);
  return data;
};

/**
 * Toggle branch active/suspended status (Super Admin only)
 * @param {String} id - Branch ID
 */
export const toggleBranchStatus = async (id) => {
  const { data } = await API.patch(`/branches/${id}/toggle`);
  return data;
};

/**
 * Permanently delete a branch (Super Admin only - fails if it has dependencies)
 * @param {String} id - Branch ID
 */
export const deleteBranch = async (id) => {
  const { data } = await API.delete(`/branches/${id}`);
  return data;
};