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
  const { authUser } = useAuth();
  
  const roleName = typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name;
  const isMaster = roleName === "superadmin" || authUser?.permissions?.includes("all_access");
  
  const [selectedBranch, setSelectedBranch] = useState(
    !isMaster ? (typeof authUser?.branch === 'object' ? authUser?.branch?._id : authUser?.branch) : ""
  );

  const { data: batchRes, isLoading: batchLoading } = useBatchById(editId);
  
  const batchData = isEditMode ? (batchRes?.data?.data || batchRes?.data || batchRes) : null;

  const { mutate: createBatch, isPending: isCreating } = useCreateBatch();
  const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch();
  const isPending = isCreating || isUpdating;

  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  const { data: branchesResponse, isLoading: branchesLoading } = useBranches();
  
  const { data: rolesResponse } = useRoles();
  const instructorRoleId = useMemo(() => {
     if (!rolesResponse?.data) return null;
     const instructorRole = rolesResponse.data.find(r => r.name.toLowerCase() === "instructor");
     return instructorRole?._id;
  }, [rolesResponse]);

  useEffect(() => {
    if (isEditMode && batchData) {
      const branchId = batchData.branch?._id || batchData.branch;
      if (branchId) setSelectedBranch(branchId);
    }
  }, [isEditMode, batchData]);

  const { data: instructorsResponse } = useUsers(
    1, 100, 
    { 
      ...(instructorRoleId ? { role: instructorRoleId } : {}), 
      ...(selectedBranch ? { branch: selectedBranch } : {}) 
    },
    { enabled: !!instructorRoleId && !!selectedBranch } 
  );

  const initialData = useMemo(() => {
    if (!isEditMode) return {}; 
    if (!batchData || Object.keys(batchData).length === 0) return null;
    
    // console.log("Loaded Batch Data for Edit:", batchData);

    return {
      batch_name: batchData.batch_name || "",
      course: batchData.course?._id || batchData.course || "",
      branch: batchData.branch?._id || batchData.branch || "",
      instructors: batchData.instructors?.map(inst => inst._id || inst) || [],
      schedule_days: batchData.schedule_days || [],
      start_time: batchData.time_slot?.start_time || "",
      end_time: batchData.time_slot?.end_time || "",
      start_date: batchData.start_date ? new Date(batchData.start_date).toISOString().split('T')[0] : "",
      status: batchData.status || "Active"
    };
  }, [isEditMode, batchData]);

  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ value: b._id, label: b.branch_name }));
  }, [branchesResponse]);

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  const instructorOptions = useMemo(() => {
    let instructorsArray = instructorsResponse?.data || [];
    if (selectedBranch && !isEditMode) {
      instructorsArray = instructorsArray.filter(inst => inst.branch === selectedBranch || inst.branch?._id === selectedBranch);
    }
    return instructorsArray.map((inst) => ({
      value: inst._id,
      label: inst.full_name, 
    }));
  }, [instructorsResponse, selectedBranch, isEditMode]);

  const batchConfig = [
    { name: "batch_name", label: "Batch Title", placeholder: "e.g. Morning Professional Intake", required: true },
    
    ...(isMaster ? [{
      name: "branch", label: "Campus / Location", type: "select", options: branchOptions, required: true,
      defaultOption: "Select Campus",
      onChange: (e) => setSelectedBranch(e?.target ? e.target.value : e)
    }] : []),

    { name: "course", label: "Associated Course", type: "select", options: courseOptions, required: true, defaultOption: "Select Course" },

    ...(selectedBranch ? [{
      name: "instructors", label: "Assign Instructors (Select all that apply)", type: "checkbox-group", options: instructorOptions, required: true, 
    }] : []),

    {
      name: "schedule_days", label: "Select Class Days", type: "checkbox-group",
      options: [
        { value: "Saturday", label: "Saturday" }, { value: "Sunday", label: "Sunday" },
        { value: "Monday", label: "Monday" }, { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" }, { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
      ],
      required: true,
    },

    { name: "start_time", label: "Class Start Time", type: "time", required: true },
    { name: "end_time", label: "Class End Time", type: "time", required: true },
    { name: "start_date", label: "Official Start Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: [{ value: "Upcoming", label: "Upcoming" }, { value: "Active", label: "Active" }, { value: "Completed", label: "Completed" }] },
  ];

  const handleSubmit = (formData, jsonPayload) => {
    const finalBranch = !isMaster ? (typeof authUser?.branch === 'object' ? authUser?.branch?._id : authUser?.branch) : jsonPayload.branch;
    jsonPayload.branch = finalBranch;

    const mode = isEditMode ? "edit" : "add";
    const validationResult = getBatchFormSchema(mode).safeParse(jsonPayload);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0].message;
      Swal.fire({ icon: "error", title: "Validation Failed", text: firstError });
      return; 
    }

    const { start_time, end_time, ...restOfPayload } = jsonPayload;
    const finalPayload = {
      ...restOfPayload,
      time_slot: { start_time, end_time },
      branch: finalBranch
    };

    if (isEditMode) {
      updateBatch({ id: editId, ...finalPayload }, { onSuccess: () => navigate("/admin/manage-batches") });
    } else {
      createBatch(finalPayload, { onSuccess: () => navigate("/admin/manage-batches") });
    }
  };

  const isReady = !isEditMode || (isEditMode && initialData && Object.keys(initialData).length > 0);

  if (coursesLoading || branchesLoading || (isEditMode && batchLoading) || !isReady) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <EntityForm
        key={editId || "add"} 
        title={isEditMode ? "Update Batch" : "Initialize Batch"}
        subtitle={isEditMode ? `Editing configurations for ${initialData.batch_name}` : "Select the specific days and times to generate a custom schedule."}
        config={batchConfig}
        initialData={initialData} 
        onSubmit={handleSubmit}
        isLoading={isPending}
        buttonText={isEditMode ? "Save Changes" : "Create Batch"}
        onCancel={() => navigate("/admin/manage-batches")}
      />
    </div>
  );
};

export default AddBatch;