import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as CourseAPI from "../api/courses.api.js";

export const useCourses = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["courses", page, filters],
    queryFn: () => CourseAPI.fetchCourses(page, limit, filters),
    keepPreviousData: true,
    onError: (error) => toast.error(`Failed to load courses: ${error.message}`),
  });
};

export const useActiveCourses = (filters = {}) => {
  return useQuery({
    queryKey: ["courses", "active", filters],
    queryFn: () => CourseAPI.fetchActiveCourses(filters),
    onError: (error) => toast.error(`Failed to load active courses: ${error.message}`),
  });
};

export const useCourse = (id) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => CourseAPI.fetchCourseById(id),
    enabled: !!id,
    onError: (error) => toast.error(`Failed to load course details: ${error.message}`),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CourseAPI.createCourse,
    onSuccess: () => {
      toast.success("Course created successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to create course"),
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CourseAPI.updateCourse,
    onSuccess: (_, variables) => {
      toast.success("Course updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update course"),
  });
};

export const useToggleCourseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CourseAPI.toggleCourseStatus,
    onSuccess: () => {
      toast.success("Course status toggled successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to toggle status"),
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: CourseAPI.deleteCourse,
    onSuccess: () => {
      toast.success("Course deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete course"),
  });
};