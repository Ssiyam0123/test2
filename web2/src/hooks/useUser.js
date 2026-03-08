import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as UserAPI from "../api/user.api.js";

export const useUsers = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["users", page, filters],
    queryFn: () => UserAPI.fetchUsers(page, limit, filters),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => UserAPI.fetchUserById(id),
    enabled: !!id,
  });
};

export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => UserAPI.fetchUserBySearch(query),
    enabled: !!query && query.trim().length > 0,
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.addUser,
    onSuccess: () => {
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create user")
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.updateUser,
    onSuccess: (_, variables) => {
      toast.success("User updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update user")
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.updateUserStatus,
    onSuccess: (_, variables) => {
      toast.success("User status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update status")
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.updateUserRole,
    onSuccess: () => {
      toast.success("User role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update role")
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData(["users"]);
      
      queryClient.setQueryData(["users"], (old) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter(user => user._id !== id),
        };
      });
      
      return { previousUsers };
    },
    onSuccess: () => toast.success("User deleted successfully!"),
    onError: (error, id, context) => {
      if (context?.previousUsers) queryClient.setQueryData(["users"], context.previousUsers);
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
};

export const useRemoveUserPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.removeUserPhoto,
    onSuccess: (_, id) => {
      toast.success("Photo removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to remove photo")
  });
};