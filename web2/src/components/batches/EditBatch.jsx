import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntityForm from "../common/EntityForm";
import { useActiveBatches, useUpdateBatch } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import Loader from "../../components/Loader";

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: batchesResponse, isLoading: batchesLoading } = useActiveBatches();
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  const { mutate: updateBatch, isPending } = useUpdateBatch();

  // Find the current batch data from the cached batches list
  const currentBatch = useMemo(() => 
    batchesResponse?.data?.find(b => b._id === id), 
  [batchesResponse, id]);

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  const config = [
    { name: "batch_name", label: "Batch Name", required: true },
    { name: "course", label: "Associated Course", type: "select", options: courseOptions, required: true },
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
    { name: "status", label: "Status", type: "select", options: [
      { value: "Upcoming", label: "Upcoming" }, 
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" }
    ]}
  ];

  const handleSubmit = (formData, jsonPayload) => {
    // We send the jsonPayload to the update hook
    updateBatch({ id, ...jsonPayload }, { 
      onSuccess: () => navigate("/admin/all-batches") // Adjust path to your table page
    });
  };

  if (batchesLoading || coursesLoading || !currentBatch) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <EntityForm 
        title="Edit Batch Settings"
        subtitle={`Updating configuration for ${currentBatch.batch_name}`}
        mode="edit"
        initialData={{
          ...currentBatch,
          // Format date for the HTML5 date input (YYYY-MM-DD)
          start_date: currentBatch.start_date ? currentBatch.start_date.split('T')[0] : ""
        }}
        config={config}
        onSubmit={handleSubmit}
        isLoading={isPending}
        buttonText="Save Changes"
        onCancel={() => navigate("/admin/all-batches")}
      />
    </div>
  );
};

export default EditBatch;