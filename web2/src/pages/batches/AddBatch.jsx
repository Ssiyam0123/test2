import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useCreateBatch, useUpdateBatch, useBatchById } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import { useBranches } from "../../hooks/useBranches"; 
import { useUsers } from "../../hooks/useUser"; 
import { useRoles } from "../../hooks/useRoles"; 
import Swal from "sweetalert2";
import { getBatchFormSchema } from "../../validators/zodSchemas"; 
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader";

const AddBatch = () => {
  const { id, batchId } = useParams(); 
  const editId = id || batchId;
  const isEditMode = !!editId;
  
  const navigate = useNavigate();
  const { authUser, isMaster: checkMaster } = useAuth();
  const isMaster = typeof checkMaster === 'function' ? checkMaster() : false;

  const [selectedBranch, setSelectedBranch] = useState(
    !isMaster ? (authUser?.branch?._id || authUser?.branch) : ""
  );

  const { data: batchData, isLoading: batchLoading } = useBatchById(editId);
  const { mutate: createBatch, isPending: isCreating } = useCreateBatch();
  const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch();
  const isPending = isCreating || isUpdating;

  // Data Extraction
  const { data: coursesRes, isLoading: coursesLoading } = useCourses();
  const courses = coursesRes?.data || []; 

  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: roles = [] } = useRoles();

  const instructorRoleId = useMemo(() => {
     return roles.find(r => r?.name?.toLowerCase() === "instructor")?._id;
  }, [roles]);

  useEffect(() => {
    if (isEditMode && batchData) {
      const bId = batchData.branch?._id || batchData.branch;
      if (bId) setSelectedBranch(bId);
    }
  }, [isEditMode, batchData]);

  // Clean API Parameters
  const userFilters = useMemo(() => {
    const filters = {};
    if (instructorRoleId) filters.role = instructorRoleId;
    if (selectedBranch) filters.branch = selectedBranch;
    return filters;
  }, [instructorRoleId, selectedBranch]);

  const { data: instructorsRes } = useUsers(
    1, 100, 
    userFilters,
    { enabled: !!instructorRoleId && !!selectedBranch } 
  );
  
  const instructors = Array.isArray(instructorsRes?.data) ? instructorsRes.data : (Array.isArray(instructorsRes) ? instructorsRes : []);

  const initialData = useMemo(() => {
    if (!isEditMode) return { schedule_days: [], status: "Active" }; 
    if (!batchData) return null;
    
    // Safe Date Parsing
    let safeStartDate = "";
    if (batchData.start_date) {
      const d = new Date(batchData.start_date);
      if (!isNaN(d.getTime())) safeStartDate = d.toISOString().split('T')[0];
    }

    return {
      batch_name: batchData.batch_name || "",
      course: batchData.course?._id || batchData.course || "",
      branch: batchData.branch?._id || batchData.branch || "",
      instructors: batchData.instructors?.map(inst => inst._id || inst) || [],
      schedule_days: batchData.schedule_days || [],
      start_time: batchData.time_slot?.start_time || "",
      end_time: batchData.time_slot?.end_time || "",
      start_date: safeStartDate,
      status: batchData.status || "Active"
    };
  }, [isEditMode, batchData]);

  const batchConfig = [
    { name: "batch_name", label: "Batch Title", placeholder: "e.g. Morning Professional Intake", required: true },
    ...(isMaster ? [{
      name: "branch", label: "Campus / Location", type: "select", 
      options: branches.map(b => ({ value: b._id, label: b.branch_name })), 
      required: true,
      defaultOption: "Select Campus",
      onChange: (e) => setSelectedBranch(e?.target ? e.target.value : e)
    }] : []),
    { 
      name: "course", label: "Associated Course", type: "select", 
      options: courses.map(c => ({ value: c._id, label: c.course_name })), 
      required: true, defaultOption: "Select Course" 
    },
    {
      name: "instructors", label: "Assign Instructors", type: "checkbox-group", 
      options: instructors.map(inst => ({ value: inst._id, label: inst.full_name })), 
      required: true, 
    },
    {
      name: "schedule_days", label: "Select Class Days", type: "checkbox-group",
      options: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(d => ({ value: d, label: d })),
      required: true,
    },
    { name: "start_time", label: "Class Start Time", type: "time", required: true },
    { name: "end_time", label: "Class End Time", type: "time", required: true },
    { name: "start_date", label: "Official Start Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: [{ value: "Upcoming", label: "Upcoming" }, { value: "Active", label: "Active" }, { value: "Completed", label: "Completed" }] },
  ];

  const handleSubmit = (formData, jsonPayload) => {
    const finalBranch = !isMaster ? (authUser?.branch?._id || authUser?.branch) : jsonPayload.branch;
    
    if (!finalBranch) {
      return Swal.fire("Error", "Please select a valid campus/branch.", "error");
    }

    // SECURITY FIX: Filter out instructors from previous branches
    const validInstructorIds = instructors.map(inst => inst._id);
    const safeInstructors = (jsonPayload.instructors || []).filter(id => validInstructorIds.includes(id));

    if (safeInstructors.length === 0 && (jsonPayload.instructors || []).length > 0) {
      return Swal.fire("Instructor Mismatch", "The selected instructors do not belong to the chosen branch. Please re-assign instructors for this branch.", "error");
    }

    const payloadToValidate = { 
      ...jsonPayload, 
      branch: finalBranch,
      instructors: safeInstructors 
    };
    
    const validationResult = getBatchFormSchema(isEditMode ? "edit" : "add").safeParse(payloadToValidate);
    
    if (!validationResult.success) {
      const errorIssues = validationResult.error?.issues || validationResult.error?.errors || [];
      const firstError = errorIssues[0]?.message || "Please fill all required fields correctly.";
      return Swal.fire({ icon: "error", title: "Validation Failed", text: firstError });
    }

    const { start_time, end_time, ...rest } = payloadToValidate;
    const finalPayload = { 
      ...rest, 
      time_slot: { start_time, end_time } 
    };

    const mutationOptions = { 
      onSuccess: () => {
        Swal.fire("Success!", `Batch successfully ${isEditMode ? "updated" : "created"}.`, "success");
        navigate("/admin/manage-batches");
      },
      onError: (err) => {
        const errorMsg = err.response?.data?.message || err.message || "Failed to connect to server.";
        Swal.fire("Server Error", `Operation failed: ${errorMsg}`, "error");
      }
    };

    if (isEditMode) {
      updateBatch({ id: editId, ...finalPayload }, mutationOptions);
    } else {
      createBatch(finalPayload, mutationOptions);
    }
  };

  if (coursesLoading || branchesLoading || (isEditMode && batchLoading) || (isEditMode && !initialData)) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <EntityForm
        key={editId || "add"} 
        title={isEditMode ? "Update Batch" : "Initialize Batch"}
        subtitle={isEditMode ? `Editing configurations for ${initialData?.batch_name || 'Batch'}` : "Generate a custom schedule for a new intake."}
        config={batchConfig}
        initialData={initialData} 
        onSubmit={handleSubmit}
        isLoading={isPending}
        buttonText={isEditMode ? "Save Changes" : "Create Batch"}
        onCancel={() => navigate("/admin/manage-batches")}
        buttonColor="bg-slate-900 hover:bg-teal-600 shadow-xl"
      />
    </div>
  );
};

export default AddBatch;