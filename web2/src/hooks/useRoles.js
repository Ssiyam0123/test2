import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as RoleAPI from "../api/role.api";
import { API } from "../api/axios";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: RoleAPI.fetchRoles,
  });
};

export const useRole = (id) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => RoleAPI.fetchRoleById(id),
    enabled: !!id, 
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RoleAPI.createRole,
    onSuccess: () => {
      toast.success("Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to create role."),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RoleAPI.updateRole,
    onSuccess: (_, variables) => {
      toast.success("Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", variables.id] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to update role."),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: RoleAPI.deleteRole,
    onSuccess: () => {
      toast.success("Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to delete role."),
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permissions }) => {
      const { data } = await API.put(`/roles/${id}/permissions`, { permissions });
      return data.data; // 🚀 FIXED: Returns raw object
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    }
  });
};