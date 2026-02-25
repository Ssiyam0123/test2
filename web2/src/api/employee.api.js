import { API } from "./axios.js";

// Admin: Get all employees with pagination and filters
export const fetchEmployees = async (page = 1, limit = 30, filters = {}) => {
  const params = new URLSearchParams({ page, limit, ...filters });
  const { data } = await API.get(`/employees/all?${params}`);
  return data;
};

// Admin: Get a single employee by ID
export const fetchEmployeeById = async (id) => {
  const { data } = await API.get(`/employees/admin/${id}`);
  return data;
};

// Admin: Search employees by ID, Name, or Email
export const fetchEmployeesBySearch = async (query) => {
  if (!query.trim()) throw new Error("Search query is required");
  const { data } = await API.get(`/employees/search?query=${encodeURIComponent(query.trim())}`);
  return data;
};

// Admin: Add a new employee (handles form data / image uploads)
export const addEmployee = async (formData) => {
  const { data } = await API.post("/employees/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Admin: Update an existing employee (handles form data / image uploads)
export const updateEmployee = async ({ id, formData }) => {
  const { data } = await API.put(`/employees/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Admin: Update employee status (e.g., 'Active', 'On Leave', 'Resigned')
export const updateEmployeeStatus = async ({ id, status }) => {
  // Note: Unlike the student toggle, the employee controller expects a specific status in the body
  const { data } = await API.patch(`/employees/update-status/${id}`, { status });
  return data;
};



// Admin: Remove an employee's photo without deleting the profile
export const removeEmployeePhoto = async (id) => {
  const { data } = await API.delete(`/employees/remove-image/${id}`);
  return data;
};

// Add these to your existing employee service file

// Admin: Get all employees for the "Manage Admins" list
export const fetchAllUsers = async () => {
  const { data } = await API.get("/employees/users");
  return data;
};

// Admin: Toggle between 'admin' and 'staff' roles
export const toggleAdminRole = async (id) => {
  const { data } = await API.patch(`/employees/toggle-role/${id}`);
  return data;
};


// Find your toggle status API function and change the URL:
export const updateUserStatus = async ({ id, status }) => {
  // CHANGE FROM: `/users/update-status/${id}`
  // TO THIS:
  const { data } = await API.patch(`/users/${id}/status`, { status });
  return data;
};

// Find your update role API function and change the URL:
export const updateUserRole = async ({ id, role }) => {
  // CHANGE FROM: `/users/update-role/${id}`
  // TO THIS:
  const { data } = await API.patch(`/users/${id}/role`, { role });
  return data;
};