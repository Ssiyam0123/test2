import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../api/axios";
import toast from "react-hot-toast";

export const useActiveBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => (await API.get("/batches")).data,
  });
};

// Fetches the separate classes from the ClassContent collection
export const useBatchClasses = (batchId) => {
  return useQuery({
    queryKey: ["batchClasses", batchId],
    queryFn: async () => batchId ? (await API.get(`/batches/${batchId}/classes`)).data : { data: [] },
    enabled: !!batchId, 
  });
};

export const useAddBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchData) => (await API.post("/batches", batchData)).data,
    onSuccess: () => { toast.success("Batch created!"); queryClient.invalidateQueries(["batches"]); }
  });
};


export const useScheduleClass = (batchId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ classContentId, date_scheduled }) => {
      // Pass the variables directly, and keep the payload clean
      const response = await API.put(`/batches/classes/${classContentId}/schedule`, { 
        date_scheduled 
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Topic Scheduled!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    }
  });
};

export const useAddSyllabusItem = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (syllabusData) => {
      // Sends data to POST /api/batches/:batchId/syllabus
      const { data } = await API.post(`/batches/${batchId}/syllabus`, syllabusData);
      return data;
    },
    onSuccess: () => {
      toast.success("Added to Syllabus!");
      // Refreshes the calendar instantly!
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    }
  });
};






export const useUpdateClassContent = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ classId, ...updateData }) => {
      // API: PUT /api/batches/classes/:classId
      const { data } = await API.put(`/batches/classes/${classId}`, updateData);
      return data;
    },
    onSuccess: () => {
      toast.success("Class updated successfully!");
      // ওই ব্যাচের ক্লাস লিস্ট রিফ্রেশ করা
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    }
  });
};


export const useBatchesByStatus = (status = "all") => {
  return useQuery({
    queryKey: ["batches", status],
    queryFn: async () => (await API.get(`/batches?status=${status}`)).data,
  });
};

export const useDeleteClass = (batchId) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (classId) => {
      // API endpoint: DELETE /api/batches/classes/:classId
      const { data } = await API.delete(`/batches/classes/${classId}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Class removed successfully");
      // ব্যাচের সব ক্লাস রিফ্রেশ করা যাতে ক্যালেন্ডার থেকে ডেটা চলে যায়
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete class");
    }
  });
};


// export const useAutoSchedule = (batchId) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async () => {
//       const { data } = await API.post(`/batches/${batchId}/auto-schedule`);
//       return data;
//     },
//     onSuccess: () => {
//       toast.success("Calendar populated based on schedule!");
//       queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
//     },
//     onError: (error) => {
//       toast.error(error.response?.data?.message || "Scheduling failed");
//     }
//   });
// };


// src/hooks/useBatches.js
export const useAutoSchedule = (batchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // Ensure the URL matches your backend route
      const { data } = await API.post(`/batches/${batchId}/auto-schedule`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Calendar populated!");
      queryClient.invalidateQueries({ queryKey: ["batchClasses", batchId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Scheduling failed");
    }
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      const { data } = await API.put(`/batches/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      toast.success("Batch updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    }
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await API.delete(`/batches/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Batch deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error) => {
      toast.error("Failed to delete batch");
    }
  });
};