import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntityForm from "../common/EntityForm";
import { useBatchById, useUpdateBatch } from "../../hooks/useBatches"; // Use specific ID hook
import { useCourses } from "../../hooks/useCourses";
import Loader from "../../components/Loader";

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch specific batch data to ensure it works on direct page refresh
  const { data: batchResponse, isLoading: batchLoading } = useBatchById(id);
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  const { mutate: updateBatch, isPending } = useUpdateBatch();

  const currentBatch = batchResponse?.data;

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  const config = [
    { name: "batch_name", label: "Batch Name", required: true },
    { 
      name: "course", 
      label: "Associated Course", 
      type: "select", 
      options: courseOptions, 
      required: true 
    },
    { 
      name: "batch_type", 
      label: "Schedule Preset", 
      type: "select", 
      options: [
        { value: "A", label: "A (Sat-Mon Morning)" },
        { value: "B", label: "B (Sat-Mon Afternoon)" },
        { value: "C", label: "C (Tue-Thu Morning)" },
        { value: "D", label: "D (Tue-Thu Afternoon)" },
        { value: "E", label: "E (Friday)" },
      ] 
    },
    { name: "start_date", label: "Start Date", type: "date" },
    { 
      name: "status", 
      label: "Status", 
      type: "select", 
      options: [
        { value: "Upcoming", label: "Upcoming" }, 
        { value: "Active", label: "Active" },
        { value: "Completed", label: "Completed" }
      ]
    }
  ];

  const handleSubmit = (formData, jsonPayload) => {
    // Send ID along with payload to the update hook
    updateBatch({ id, ...jsonPayload }, { 
      onSuccess: () => navigate("/admin/all-batches")
    });
  };

  if (batchLoading || coursesLoading) return <Loader />;
  if (!currentBatch) return <div className="p-10 text-center font-bold">Batch not found.</div>;

  return (
    // Changed: p-4 for mobile, p-6 for desktop. max-w-2xl is often better for forms.
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <EntityForm 
        title="Edit Batch"
        subtitle={`Configure settings for ${currentBatch.batch_name}`}
        mode="edit"
        initialData={{
          ...currentBatch,
          // Extract ID if course is a populated object
          course: typeof currentBatch.course === 'object' ? currentBatch.course._id : currentBatch.course,
          // Format date for HTML5 input (YYYY-MM-DD)
          start_date: currentBatch.start_date ? currentBatch.start_date.split('T')[0] : ""
        }}
        config={config}
        onSubmit={handleSubmit}
        isLoading={isPending}
        buttonText="Update Batch"
        onCancel={() => navigate("/admin/all-batches")}
      />
    </div>
  );
};

export default EditBatch;