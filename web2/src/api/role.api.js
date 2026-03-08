import { API } from "./axios";

export const fetchRoles = async () => {
  const { data } = await API.get("/roles");
  return data.data;
};

export const fetchRoleById = async (id) => {
  const { data } = await API.get(`/roles/${id}`);
  return data.data;
};

export const createRole = async (roleData) => {
  const { data } = await API.post("/roles", roleData);
  return data.data;
};

export const updateRole = async ({ id, roleData }) => {
  const { data } = await API.put(`/roles/${id}`, roleData);
  return data.data;
};

export const deleteRole = async (id) => {
  const { data } = await API.delete(`/roles/${id}`);
  return data.data;
};