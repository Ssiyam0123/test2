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
  fetchAdminStudentBySearch,
  removeStudentPhoto, // Added missing import
  addStudentComment, 
  fetchStudentComments,
  downloadStudentCertificate
} from "../api/student.api.js";


// ==========================================
// PUBLIC HOOKS (No Auth Required)
// ==========================================

/**
 * Fetch a single student profile for the public verifier (e.g., QR Code scan)
 * @Route GET /api/students/public/:id
 * @Access Public
 */
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

/**
 * Search for a student by ID or Reg Number from the public verification portal
 * @Route GET /api/students/public/search?query=...
 * @Access Public
 */
export const usePublicStudentSearch = (searchQuery, isSearchEnabled) => {
  return useQuery({
    queryKey: ["studentSearch", searchQuery],
    queryFn: () => fetchPublicStudentBySearch(searchQuery),
    enabled: isSearchEnabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: () => toast.error("Student not found. Please check the ID or Registration Number."),
    onSuccess: () => toast.success("Student record found!"),
  });
};


// ==========================================
// GENERAL PROTECTED HOOKS (View Only)
// ==========================================

/**
 * Fetch paginated and filtered list of all students
 * @Route GET /api/students/all
 * @Access Admin, Registrar, Instructor
 */
export const useStudents = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["students", page, filters],
    queryFn: () => fetchStudents(page, limit, filters),
    keepPreviousData: true,
    onError: (error) => toast.error(`Failed to load students: ${error.message}`),
  });
};


// ==========================================
// ADMIN & REGISTRAR HOOKS (Core CRUD)
// ==========================================

/**
 * Fetch full student details for the admin dashboard
 * @Route GET /api/students/admin/:id
 * @Access Admin, Registrar
 */
export const useStudent = (id, options = {}) => {
  return useQuery({
    queryKey: ["student", "admin", id],
    queryFn: () => fetchAdminStudentById(id),
    enabled: !!id && options.enabled !== false,
    onError: (error) => toast.error(`Failed to load student details: ${error.message}`),
    ...options,
  });
};

/**
 * Search students from the admin dashboard (returns limited summary list)
 * @Route GET /api/students/search?query=...
 * @Access Admin, Registrar
 */
export const useAdminStudentSearch = (searchQuery, isSearchEnabled) => {
  return useQuery({
    queryKey: ["adminStudentSearch", searchQuery],
    queryFn: () => fetchAdminStudentBySearch(searchQuery),
    enabled: isSearchEnabled && !!searchQuery,
    staleTime: 5 * 60 * 1000,
    onError: (error) => toast.error(`Search failed: ${error.message}`),
  });
};

/**
 * Create a new student profile
 * @Route POST /api/students/create
 * @Access Admin, Registrar
 */
export const useAddStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStudent,
    onSuccess: (data) => {
      toast.success(data.message || "Student added successfully!");
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to add student"),
  });
};

/**
 * Update existing student profile and handle batch transfers
 * @Route PUT /api/students/update/:id
 * @Access Admin, Registrar
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStudent,
    onSuccess: (data) => {
      toast.success(data.message || "Student updated successfully!");
      queryClient.invalidateQueries(["students"]);
      queryClient.invalidateQueries(["student", "admin", data.data?._id]);
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to update student"),
  });
};

/**
 * Toggle a student's active status
 * @Route PATCH /api/students/toggle-status/:id
 * @Access Admin, Registrar
 */
export const useToggleStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleStudentStatus,
    onSuccess: (data) => {
      const status = data.data?.is_active ? "activated" : "deactivated";
      toast.success(`Student ${status} successfully!`);
      queryClient.invalidateQueries(["students"]);
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to toggle status"),
  });
};

/**
 * Remove a student's profile photo
 * @Route DELETE /api/students/remove-image/:id
 * @Access Admin, Registrar
 */
export const useRemoveStudentPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeStudentPhoto,
    onSuccess: (data) => {
      toast.success(data.message || "Photo removed successfully!");
      queryClient.invalidateQueries(["students"]);
      if (data.data?._id) queryClient.invalidateQueries(["student", "admin", data.data._id]);
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Failed to remove photo"),
  });
};

/**
 * Permanently delete a student profile
 * @Route DELETE /api/students/delete/:id
 * @Access Admin, Registrar
 */
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
          pagination: { ...old.pagination, total: old.pagination.total - 1 },
        };
      });
      return { previousStudents };
    },
    onSuccess: (data) => toast.success(data.message || "Student deleted successfully!"),
    onError: (error, id, context) => {
      if (context?.previousStudents) queryClient.setQueryData(["students"], context.previousStudents);
      toast.error(error.response?.data?.message || error.message || "Failed to delete student");
    },
    onSettled: () => queryClient.invalidateQueries(["students"]),
  });
};


// ==========================================
// ADMIN & INSTRUCTOR HOOKS (Comments)
// ==========================================

/**
 * Fetch all comments for a specific student
 * @Route GET /api/students/:studentId/comments
 * @Access Admin, Instructor
 */
export const useStudentComments = (studentId) => {
  return useQuery({
    queryKey: ["studentComments", studentId],
    queryFn: () => fetchStudentComments(studentId),
    enabled: !!studentId,
    onError: (error) => toast.error(`Failed to load comments: ${error.message}`),
  });
};

/**
 * Add a new comment to a student profile
 * @Route POST /api/students/:studentId/comments
 * @Access Admin, Instructor
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addStudentComment,
    onSuccess: (data, variables) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries(["studentComments", variables.studentId]);
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add comment"),
  });
};

// ==========================================
// TOAST CONFIGURATION
// ==========================================

export const toastConfig = {
  success: {
    duration: 3000,
    style: { background: "#10b981", color: "#ffffff" },
    iconTheme: { primary: "#ffffff", secondary: "#10b981" },
  },
  error: {
    duration: 4000,
    style: { background: "#ef4444", color: "#ffffff" },
    iconTheme: { primary: "#ffffff", secondary: "#ef4444" },
  },
  loading: { duration: Infinity },
};


// web2/src/hooks/useStudents.js

export const useDownloadCertificate = () => {
  return useMutation({
    // FIX: Extract the ID before passing it to the API function
    mutationFn: (student) => downloadStudentCertificate(student._id),
    
    onSuccess: (blobData, student) => {
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      // Sanitize the filename to prevent spaces/special chars from breaking the download
      const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
      link.setAttribute("download", `CIB_Certificate_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Certificate downloaded successfully");
    },
    onError: (error) => {
      console.error("Download Error:", error);
      toast.error("Failed to generate certificate");
    },
  });
};