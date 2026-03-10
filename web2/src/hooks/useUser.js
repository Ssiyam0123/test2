import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as UserAPI from "../api/user.api.js";
import useAuth from "../store/useAuth"; // 🚀 Auth store import

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

// ---------------------------------------------------------
// MUTATIONS (Admin Actions)
// ---------------------------------------------------------

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.addUser,
    onSuccess: () => {
      toast.success("User created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
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
    }
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.updateUserStatus,
    onSuccess: (_, variables) => {
      toast.success("User status updated!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    }
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.updateUserRole,
    onSuccess: (_, variables) => { // 🚀 variables থেকে ID নিয়ে সিঙ্ক করলাম
      toast.success("User role updated!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    }
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
        return { ...old, data: old.data.filter(user => user._id !== id) };
      });
      return { previousUsers };
    },
    onSuccess: () => toast.success("User deleted successfully!"),
    onError: (err, id, context) => {
      if (context?.previousUsers) queryClient.setQueryData(["users"], context.previousUsers);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
};

export const useRemoveUserPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserAPI.removeUserPhoto,
    onSuccess: (_, id) => {
      toast.success("Photo removed!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    }
  });
};

// ---------------------------------------------------------
// PROFILE ACTIONS (Own Profile)
// ---------------------------------------------------------

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: UserAPI.fetchMyProfile,
    staleTime: 5 * 60 * 1000, // নিজের প্রোফাইল বারবার চেঞ্জ হয় না
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { setAuthUser } = useAuth(); // 🚀 Global Auth State update এর জন্য
  
  return useMutation({
    mutationFn: UserAPI.updateMyProfile,
    onSuccess: (data) => {
      toast.success("Profile updated!");
      
      // ১. প্রোফাইল কুয়েরি রিফ্রেশ
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      
      // ২. যদি লিস্টিং পেজে এই ইউজার থাকে তবে সেখানেও ডেটা আপডেট হবে
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // ৩. 🚀 Auth Store আপডেট (যাতে হেডার/সাইডবার সাথে সাথে নতুন ছবি/নাম পায়)
      if (setAuthUser) {
        setAuthUser(data); 
      }
    }
  });
};