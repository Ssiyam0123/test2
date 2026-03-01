import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as RoleAPI from "../api/role.api";

// ==============================
// FETCH QUERIES (GET)
// ==============================

// Hook to get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: RoleAPI.fetchRoles,
  });
};

// Hook to get a single role
export const useRole = (id) => {
  return useQuery({
    queryKey: ["role", id],
    queryFn: () => RoleAPI.fetchRoleById(id),
    enabled: !!id, // Only run if an ID is provided
  });
};

// ==============================
// MUTATION QUERIES (POST/PUT/DELETE)
// ==============================

// Hook to create a new role
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RoleAPI.createRole,
    onSuccess: (data) => {
      toast.success(data.message || "Role created successfully!");
      // Instantly refresh the roles list in the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create role.");
      console.error("Create Role Error:", error);
    },
  });
};

// Hook to update an existing role
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => RoleAPI.updateRole(id, data),
    onSuccess: (data) => {
      toast.success(data.message || "Role updated successfully!");
      // Refresh the main list and the specific role's cache
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", data.data?._id] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update role.");
      console.error("Update Role Error:", error);
    },
  });
};

// Hook to delete a role
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: RoleAPI.deleteRole,
    onSuccess: (data) => {
      toast.success(data.message || "Role deleted successfully!");
      // Remove the deleted role from the UI
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete role.");
      console.error("Delete Role Error:", error);
    },
  });
};