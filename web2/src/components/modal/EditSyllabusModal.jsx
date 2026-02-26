import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useUpdateClassContent, useDeleteClass } from "../../hooks/useBatches";
import EntityForm from "../common/EntityForm"; // Adjust path if your EntityForm is located elsewhere

export default function EditSyllabusModal({ batchId, classData, onClose }) {
  const { mutate: updateClass, isPending: isUpdating } = useUpdateClassContent(batchId);
  const { mutate: deleteClass, isPending: isDeleting } = useDeleteClass(batchId);

  // 1. Prepare Initial Data
  const initialData = useMemo(() => {
    if (!classData) return {};
    return {
      class_number: classData.class_number,
      topic: classData.topic,
      class_type: classData.class_type || "Theory",
      date_scheduled: classData.date_scheduled ? classData.date_scheduled.split("T")[0] : "",
      content_details: classData.content_details?.join("\n") || "",
      // Flattening financials for EntityForm state
      budget: classData.financials?.budget || "",
      actual_cost: classData.financials?.actual_cost || "",
      expense_notes: classData.financials?.expense_notes || "",
    };
  }, [classData]);

  // 2. Define the Form Configuration
 const formConfig = [
    // strictly set to number
    { name: "class_number", label: "Class Number", type: "number", required: true }, 
    {
      name: "class_type",
      label: "Class Type",
      type: "select",
      required: true,
      options: [
        { value: "Theory", label: "Theory" },
        { value: "Practical", label: "Practical" },
        { value: "Exam", label: "Exam" },
        { value: "Practice Session", label: "Practice Session" },
      ]
    },
    { name: "topic", label: "Topic Name", type: "text", required: true, fullWidth: true },
    { name: "date_scheduled", label: "Date (Optional)", type: "date", fullWidth: true },
    { name: "content_details", label: "Content Details (One per line)", type: "textarea", rows: "4", fullWidth: true },
    
    // ==========================================
    // FIXED: Uses `divider: true` instead of `type: "divider"`
    // ==========================================
    { name: "financialDivider", divider: true, title: "Class Logistics & Cost" },
    
    { name: "budget", label: "Allocated Budget (৳)", type: "number" },
    { name: "actual_cost", label: "Actual Expenditure (৳)", type: "number" },
    { name: "expense_notes", label: "Expense Remarks / Receipts", type: "textarea", rows: "2", fullWidth: true },
    
    {
      name: "deleteAction",
      type: "custom",
      fullWidth: true,
      render: () => (
        <button 
          type="button" 
          disabled={isDeleting}
          onClick={() => {
            if(window.confirm("Are you sure you want to permanently delete this class?")) {
              deleteClass(classData._id, { onSuccess: onClose });
            }
          }}
          className="w-full mt-2 py-3.5 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
        >
          <Trash2 size={16} /> {isDeleting ? "Deleting..." : "Delete Class Permanently"}
        </button>
      )
    }
  ];

  // 3. Handle Form Submission
  const handleSubmit = (formData, jsonPayload) => {
    // Re-package the flat JSON payload into the nested backend structure
    const formattedData = {
      class_number: jsonPayload.class_number,
      class_type: jsonPayload.class_type,
      topic: jsonPayload.topic,
      date_scheduled: jsonPayload.date_scheduled,
      content_details: jsonPayload.content_details,
      financials: {
        budget: jsonPayload.budget ? Number(jsonPayload.budget) : 0,
        actual_cost: jsonPayload.actual_cost ? Number(jsonPayload.actual_cost) : 0,
        expense_notes: jsonPayload.expense_notes || "",
      }
    };

    updateClass({ classId: classData._id, ...formattedData }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Scrollable Container to prevent cutoff on small screens */}
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[2rem]">
        <EntityForm
          title="Edit Class Information"
          subtitle={`Updating: Class ${classData?.class_number || 'N/A'}`}
          config={formConfig}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isUpdating}
          buttonText="Save Class Updates"
          buttonColor="bg-teal-600 hover:bg-teal-700 shadow-teal-500/20"
        />
      </div>
    </div>
  );
}