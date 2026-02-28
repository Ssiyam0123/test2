import React, { useMemo } from "react";
import EntityForm from "../common/EntityForm";
import { useScheduleClass } from "../../hooks/useClasses";
import { format } from "date-fns";

const AddClassModal = ({ batchId, date, unscheduledClasses, onClose }) => {
  const { mutate, isPending } = useScheduleClass(batchId);
  const safeDate = date ? new Date(date) : new Date();

  // Create dropdown options from the auto-generated syllabus
  const classOptions = useMemo(() => {
    return unscheduledClasses.map(cls => ({
      value: cls._id,
      label: `${cls.class_number} - ${cls.topic}`
    }));
  }, [unscheduledClasses]);

  const config = [
    { 
      name: "classContentId", 
      label: "Select Syllabus Topic", 
      type: "select", 
      defaultOption: "Choose a class to schedule...",
      options: classOptions,
      required: true 
    }
  ];

 // AddClassModal.jsx
  const handleSubmit = (formData, jsonPayload) => {
    // Grab the ID directly from the clean JSON object
    const classContentId = jsonPayload.classContentId;
    
    if (!classContentId) return; 

    mutate({
      classContentId,
      date_scheduled: safeDate.toISOString()
    }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md">
        <EntityForm 
          title="Schedule Class"
          subtitle={`Assigning topic to ${format(safeDate, "MMMM do, yyyy")}`}
          config={config}
          onSubmit={handleSubmit}
          isLoading={isPending}
          buttonText="Assign Date"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default AddClassModal;