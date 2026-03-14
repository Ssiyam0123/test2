import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as StudentAPI from "../api/student.api.js";

export const usePublicStudentProfile = (id, options = {}) => {
  return useQuery({
    queryKey: ["student", "public", id],
    queryFn: () => StudentAPI.fetchPublicStudentById(id),
    enabled: !!id && options.enabled !== false,
    retry: false,
  });
};

export const usePublicStudentSearch = (searchQuery, isSearchEnabled) => {
  return useQuery({
    queryKey: ["studentSearch", searchQuery],
    queryFn: () => StudentAPI.fetchPublicStudentBySearch(searchQuery),
    enabled: isSearchEnabled,
    retry: 1,
    onError: () => toast.error("Student not found. Please check ID."),
    onSuccess: () => toast.success("Student record found!"),
  });
};

export const useStudents = (page = 1, limit = 30, filters = {}) => {
  return useQuery({
    queryKey: ["students", page, filters],
    queryFn: () => StudentAPI.fetchStudents(page, limit, filters),
    keepPreviousData: true,
  });
};

export const useStudent = (id, options = {}) => {
  return useQuery({
    queryKey: ["student", "admin", id],
    queryFn: () => StudentAPI.fetchAdminStudentById(id),
    enabled: !!id && options.enabled !== false,
  });
};

export const useAdminStudentSearch = (searchQuery, isSearchEnabled) => {
  return useQuery({
    queryKey: ["adminStudentSearch", searchQuery],
    queryFn: () => StudentAPI.fetchAdminStudentBySearch(searchQuery),
    enabled: isSearchEnabled && !!searchQuery,
  });
};

export const useAddStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.addStudent,
    onSuccess: () => {
      toast.success("Student added successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add student"),
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.updateStudent,
    onSuccess: (_, variables) => {
      toast.success("Student updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", "admin", variables.id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to update student"),
  });
};

export const useToggleStudentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.toggleStudentStatus,
    onSuccess: () => {
      toast.success(`Student status updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to toggle status"),
  });
};

export const useRemoveStudentPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.removeStudentPhoto,
    onSuccess: (_, id) => {
      toast.success("Photo removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", "admin", id] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to remove photo"),
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.deleteStudent,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      const previousStudents = queryClient.getQueryData(["students"]);
      
      queryClient.setQueryData(["students"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((student) => student._id !== id),
        };
      });
      return { previousStudents };
    },
    onSuccess: () => toast.success("Student deleted successfully!"),
    onError: (error, id, context) => {
      if (context?.previousStudents) queryClient.setQueryData(["students"], context.previousStudents);
      toast.error(error.response?.data?.message || "Failed to delete student");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
};

// COMMENTS & CERTIFICATES
export const useStudentComments = (studentId) => {
  return useQuery({
    queryKey: ["studentComments", studentId],
    queryFn: () => StudentAPI.fetchStudentComments(studentId),
    enabled: !!studentId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.addStudentComment,
    onSuccess: (_, variables) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({ queryKey: ["studentComments", variables.studentId] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to add comment"),
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentAPI.deleteStudentComment,
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["studentComments"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Failed to delete comment"),
  });
};

// export const useDownloadCertificate = () => {
//   return useMutation({
//     mutationFn: (student) => StudentAPI.downloadStudentCertificate(student._id),
//     onSuccess: (blobData, student) => {
//       const url = window.URL.createObjectURL(new Blob([blobData], { type: "application/pdf" }));
//       const link = document.createElement("a");
//       link.href = url;
//       const safeName = student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
//       link.setAttribute("download", `CIB_Certificate_${safeName}.pdf`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success("Certificate downloaded successfully");
//     },
//     onError: () => toast.error("Failed to generate certificate"),
//   });
// };



export const useDownloadCertificate = () => {
  return useMutation({
    // 🚀 API তে { studentId, awardedOn } অবজেক্ট পাঠানো হচ্ছে
    mutationFn: (data) => StudentAPI.downloadStudentCertificate({ 
      studentId: data.student._id, 
      awardedOn: data.awardedOn 
    }),
    onSuccess: (blobData, variables) => {
      const url = window.URL.createObjectURL(new Blob([blobData], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const safeName = variables.student.student_name.replace(/[^a-zA-Z0-9]/g, "_");
      link.setAttribute("download", `CIB_Certificate_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully");
    },
    onError: () => toast.error("Failed to generate certificate"),
  });
};



//  useSendCertificateEmail Hook 
export const useSendCertificateEmail = () => {
  return useMutation({
    mutationFn: StudentAPI.sendStudentCertificateEmail,
    onSuccess: () => toast.success("Certificate sent to email successfully!"),
    onError: (error) => toast.error(error.response?.data?.message || "Failed to send email"),
  });
};