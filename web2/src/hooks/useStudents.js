import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchStudents,
  addStudent,
  updateStudent,
  toggleStudentStatus,
  deleteStudent,
  fetchPublicStudentById,
  fetchAdminStudentById,
  fetchPublicStudentBySearch,
} from "../api/student.api.js";

export const useStudents = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["students", page, filters],
    queryFn: () => fetchStudents(page, limit, filters),
    keepPreviousData: true,
    onError: (error) => {
      toast.error(`Failed to load students: ${error.message}`);
    },
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudent,
    onSuccess: (data) => {
      toast.success(data.message || "Student added successfully!");
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add student";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudent,
    onSuccess: (data) => {
      toast.success(data.message || "Student updated successfully!");
      queryClient.invalidateQueries(["students"]);
      queryClient.invalidateQueries(["student", data.data?._id]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update student";
      toast.error(errorMessage);
    },
  });
};

export const useToggleStudentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleStudentStatus,
    onSuccess: (data) => {
      const status = data.data?.is_active ? "activated" : "deactivated";
      toast.success(`Student ${status} successfully!`);
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle student status";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onMutate: async (id) => {
      await queryClient.cancelQueries(["students"]);
      const previousStudents = queryClient.getQueryData(["students"]);
      queryClient.setQueryData(["students"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((student) => student._id !== id),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousStudents };
    },
    onSuccess: (data) => {
      toast.success(data.message || "Student deleted successfully!");
    },
    onError: (error, id, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(["students"], context.previousStudents);
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete student";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["students"]);
    },
  });
};

export const useStudent = (id, options = {}) => {
  return useQuery({
    queryKey: ["student", "admin", id],
    queryFn: () => fetchAdminStudentById(id),
    enabled: !!id && options.enabled !== false,
    onError: (error) =>
      toast.error(`Failed to load student details: ${error.message}`),
    ...options,
  });
};

export const usePublicStudentProfile = (id, options = {}) => {
  return useQuery({
    queryKey: ["student", "public", id],
    queryFn: () => fetchPublicStudentById(id),
    enabled: !!id && options.enabled !== false,
    retry: false,
    onError: () => toast.error("Student not found or account is deactivated."),
    ...options,
  });
};

export const usePublicStudentSearch = (searchQuery, isSearchEnabled) => {
  return useQuery({
    queryKey: ["studentSearch", searchQuery],
    queryFn: () => fetchPublicStudentBySearch(searchQuery),
    enabled: isSearchEnabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: () =>
      toast.error(
        "Student not found. Please check the ID or Registration Number.",
      ),
    onSuccess: () => toast.success("Student record found!"),
  });
};

// ... existing imports
import { addStudentComment, fetchStudentComments } from "../api/student.api.js";

/**
 * Hook to add a new comment to a student profile
 * Restricted to Admins and Instructors on the backend
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentComment,
    onSuccess: (data, variables) => {
      toast.success("Comment added successfully");
      // Invalidate the comments list for this specific student to trigger a refresh
      queryClient.invalidateQueries(["studentComments", variables.studentId]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add comment";
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to fetch all comments for a specific student
 */
export const useStudentComments = (studentId) => {
  return useQuery({
    queryKey: ["studentComments", studentId],
    queryFn: () => fetchStudentComments(studentId),
    enabled: !!studentId, // Only run if studentId is provided
    onError: (error) => {
      toast.error(`Failed to load comments: ${error.message}`);
    },
  });
};

export const toastConfig = {
  success: {
    duration: 3000,
    style: {
      background: "#10b981",
      color: "#ffffff",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#10b981",
    },
  },
  error: {
    duration: 4000,
    style: {
      background: "#ef4444",
      color: "#ffffff",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#ef4444",
    },
  },
  loading: {
    duration: Infinity,
  },
};
