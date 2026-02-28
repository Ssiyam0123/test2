import { API } from "./axios.js";

// Get all courses with pagination and filters
export const fetchCourses = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/courses/all?${params}`);
  return data;
};

// Get active courses only (NOW ACCEPTS FILTERS)
export const fetchActiveCourses = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const { data } = await API.get(`/courses/active?${params}`);
  return data;
};

// ... (keep the rest of your fetchCourseById, createCourse, updateCourse, etc. exactly as they were)
export const fetchCourseById = async (id) => {
  const { data } = await API.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (courseData) => {
  const { data } = await API.post('/courses/create', courseData);
  return data;
};

export const updateCourse = async ({ id, ...courseData }) => {
  const { data } = await API.put(`/courses/update/${id}`, courseData);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await API.delete(`/courses/delete/${id}`);
  return data;
};

export const toggleCourseStatus = async (id) => {
  const { data } = await API.patch(`/courses/toggle-status/${id}`);
  return data;
};