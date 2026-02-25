import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useAddBatch } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import Loader from "../../components/Loader";

const AddBatch = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useAddBatch();
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  const batchConfig = [
    { name: "batch_name", label: "Batch Title", placeholder: "e.g. Morning Professional Intake", required: true },
    { name: "course", label: "Associated Course", type: "select", options: courseOptions, required: true },
    
    // UPDATED: Now uses the new checkbox-group type
    { 
      name: "schedule_days", 
      label: "Select Class Days", 
      type: "checkbox-group", 
      options: [
        { value: "Saturday", label: "Saturday" },
        { value: "Sunday", label: "Sunday" },
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" }
      ],
      required: true
    },

    // Time Inputs
    { name: "start_time", label: "Class Start Time", type: "time", required: true },
    { name: "end_time", label: "Class End Time", type: "time", required: true },
    
    { name: "start_date", label: "Official Start Date", type: "date", required: true },
    { name: "status", label: "Initial Status", type: "select", options: [
      { value: "Upcoming", label: "Upcoming" }, 
      { value: "Active", label: "Active" }
    ]}
  ];

  const handleSubmit = (formData, jsonPayload) => {
    // jsonPayload already has the data perfectly formatted!
    // Example: { batch_name: "...", schedule_days: ["Saturday", "Sunday"], start_time: "10:30" }
    
    mutate(jsonPayload, { onSuccess: () => navigate("/admin/manage-batches") });
  };

  if (coursesLoading) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <EntityForm 
        title="Initialize Batch"
        subtitle="Select the specific days and times to generate a custom schedule."
        config={batchConfig} 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
        buttonText="Create Batch" 
        onCancel={() => navigate("/admin/manage-batches")}
      />
    </div>
  );
};

export default AddBatch;