import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchUsers,
  fetchUserById,
  fetchUserBySearch,
  addUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  removeUserPhoto
} from "../api/user.api.js";

// 1. Fetch all users with pagination and filters
export const useUsers = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["users", page, filters],
    queryFn: () => fetchUsers(page, limit, filters),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes to prevent aggressive refetching
    onError: (error) => toast.error(`Failed to load users: ${error.message}`)
  });
};

// 2. Fetch a single user by ID
export const useUser = (id) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
    onError: (error) => toast.error(`Failed to load user details: ${error.message}`)
  });
};

// 3. Search users (Quick Search)
export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => fetchUserBySearch(query),
    enabled: !!query && query.trim().length > 0,
    onError: (error) => toast.error(`Search failed: ${error.message}`)
  });
};

// 4. Create a new user
export const useAddUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addUser,
    onSuccess: (data) => {
      toast.success(data.message || "User created successfully!");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create user")
  });
};

// 5. Update an existing user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      toast.success(data.message || "User updated successfully!");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", data.data?._id]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update user")
  });
};

// 6. Update user status (Active / On Leave / Resigned)
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: (data) => {
      toast.success(data.message || "User status updated successfully!");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", data.data?._id]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update status")
  });
};

// 7. Update User Role
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: (data) => {
      toast.success(data.message || "User role updated successfully!");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update role")
  });
};

// 8. Delete a user permanently
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["users"]);
      const previousUsers = queryClient.getQueryData(["users"]);
      
      queryClient.setQueryData(["users"], (old) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter(user => user._id !== id),
          pagination: { ...old.pagination, total: Math.max(0, old.pagination.total - 1) }
        };
      });
      
      return { previousUsers };
    },
    onSuccess: (data) => toast.success(data.message || "User deleted successfully!"),
    onError: (error, id, context) => {
      if (context?.previousUsers) queryClient.setQueryData(["users"], context.previousUsers);
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
    onSettled: () => queryClient.invalidateQueries(["users"])
  });
};

// 9. Remove user photo
export const useRemoveUserPhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeUserPhoto,
    onSuccess: (data) => {
      toast.success(data.message || "Photo removed successfully!");
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", data.data?._id]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to remove photo")
  });
};