import { API } from "./axios.js";

export const fetchCourses = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/courses/all?${params}`);
  return data;
};

export const fetchActiveCourses = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const { data } = await API.get(`/courses/active?${params}`);
  return data;
};

// 🚀 FIXED: Unwrapping ApiResponse data
export const fetchCourseById = async (id) => {
  const { data } = await API.get(`/courses/${id}`);
  return data.data; 
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