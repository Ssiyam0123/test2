import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useAddBatch, useBatchById, useUpdateBatch } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import Loader from "../../components/Loader";

const BatchFormContainer = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: batchResponse, isLoading: batchLoading } = useBatchById(id);
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  
  const { mutate: addBatch, isPending: isAdding } = useAddBatch();
  const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch();

  const currentBatch = batchResponse?.data;

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  const batchConfig = [
    { name: "batch_name", label: "Batch Title", placeholder: "e.g. MERN Stack Intake 1", required: true },
    { name: "course", label: "Associated Course", type: "select", options: courseOptions, required: true },
    { 
      name: "schedule_days", 
      label: "Class Days", 
      type: "checkbox-group", 
      options: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({ value: d, label: d })),
      required: true
    },
    { name: "start_time", label: "Start Time", type: "time", required: true },
    { name: "end_time", label: "End Time", type: "time", required: true },
    { name: "start_date", label: "Start Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: [
      { value: "Upcoming", label: "Upcoming" }, 
      { value: "Active", label: "Active" },
      { value: "Completed", label: "Completed" }
    ]}
  ];

  const handleSubmit = (formData, jsonPayload) => {
    // Structure the payload for Mongoose
    const finalData = {
      ...jsonPayload,
      time_slot: {
        start_time: jsonPayload.start_time || "",
        end_time: jsonPayload.end_time || ""
      }
    };

    // Remove the flat fields so they don't interfere
    delete finalData.start_time;
    delete finalData.end_time;

    if (isEdit) {
      updateBatch({ id, ...finalData }, { 
        onSuccess: () => navigate("/admin/batches") 
      });
    } else {
      addBatch(finalData, { 
        onSuccess: () => navigate("/admin/batches") 
      });
    }
  };

  if (coursesLoading || (isEdit && batchLoading)) return <Loader />;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <EntityForm 
        title={isEdit ? "Edit Batch Settings" : "Initialize New Batch"}
        config={batchConfig} 
        mode={isEdit ? "edit" : "create"}
        initialData={isEdit ? {
          ...currentBatch,
          course: typeof currentBatch?.course === 'object' ? currentBatch.course._id : currentBatch?.course,
          start_date: currentBatch?.start_date ? currentBatch.start_date.split('T')[0] : "",
          // Flatten for EntityForm display
          start_time: currentBatch?.time_slot?.start_time || "",
          end_time: currentBatch?.time_slot?.end_time || ""
        } : { status: "Upcoming" }}
        onSubmit={handleSubmit} 
        isLoading={isAdding || isUpdating} 
        buttonText={isEdit ? "Save Changes" : "Create Batch"} 
        onCancel={() => navigate("/admin/batches")}
      />
    </div>
  );
};

export default BatchFormContainer;