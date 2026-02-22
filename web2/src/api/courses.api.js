import { API } from "./axios.js";

// Get all courses with pagination and filters
export const fetchCourses = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  
  const { data } = await API.get(`/courses/all?${params}`);
  return data;
};

// Get active courses only
export const fetchActiveCourses = async () => {
  const { data } = await API.get('/courses/active');
  return data;
};

// Get course by ID
export const fetchCourseById = async (id) => {
  const { data } = await API.get(`/courses/${id}`);
  return data;
};

// Create new course
export const createCourse = async (courseData) => {
  const { data } = await API.post('/courses/create', courseData);
  return data;
};

// Update course
export const updateCourse = async ({ id, ...courseData }) => {
  const { data } = await API.put(`/courses/update/${id}`, courseData);
  return data;
};

// Delete course
export const deleteCourse = async (id) => {
  const { data } = await API.delete(`/courses/delete/${id}`);
  return data;
};

// Toggle course status
export const toggleCourseStatus = async (id) => {
  const { data } = await API.patch(`/courses/toggle-status/${id}`);
  return data;
};