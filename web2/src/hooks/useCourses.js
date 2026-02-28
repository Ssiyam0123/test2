import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchCourses,
  fetchActiveCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} from "../api/courses.api.js";
export const useCourses = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["courses", page, filters],
    queryFn: () => fetchCourses(page, limit, filters),
    keepPreviousData: true,
    onError: (error) => toast.error(`Failed to load courses: ${error.message}`),
  });
};

// NOW ACCEPTS FILTERS AND ADDS THEM TO QUERY KEY
export const useActiveCourses = (filters = {}) => {
  return useQuery({
    queryKey: ["courses", "active", filters],
    queryFn: () => fetchActiveCourses(filters),
    onError: (error) =>
      toast.error(`Failed to load active courses: ${error.message}`),
  });
};

// ... (keep the rest of your useCourse, useCreateCourse, etc. exactly as they were)
export const useCourse = (id) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
    onError: (error) =>
      toast.error(`Failed to load course details: ${error.message}`),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: (data) => {
      toast.success(data.message || "Course created successfully!");
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create course";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCourse,
    onSuccess: (data) => {
      toast.success(data.message || "Course updated successfully!");
      queryClient.invalidateQueries(["courses"]);
      queryClient.invalidateQueries(["course", data.data?._id]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update course";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["courses"]);

      // Snapshot the previous value
      const previousCourses = queryClient.getQueryData(["courses"]);

      // Optimistically update the cache
      queryClient.setQueryData(["courses"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((course) => course._id !== id),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousCourses };
    },
    onSuccess: (data) => {
      toast.success(data.message || "Course deleted successfully!");
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousCourses) {
        queryClient.setQueryData(["courses"], context.previousCourses);
      }
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete course";
      toast.error(errorMessage);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["courses"]);
    },
  });
};

export const useToggleCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCourseStatus,
    onSuccess: (data) => {
      const status = data.data?.is_active ? "activated" : "deactivated";
      toast.success(`Course ${status} successfully!`);
      queryClient.invalidateQueries(["courses"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to toggle course status";
      toast.error(errorMessage);
    },
  });
};
