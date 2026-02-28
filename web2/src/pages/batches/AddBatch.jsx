import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useCreateBatch } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import { useBranches } from "../../hooks/useBranches"; 
import { useUsers } from "../../hooks/useUser"; 
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader";

const AddBatch = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  // 1. STATE: Track the currently selected campus
  // If Admin: Starts empty. If Staff: Starts with their assigned branch.
  const [selectedBranch, setSelectedBranch] = useState(
    authUser?.role !== "admin" ? authUser?.branch : ""
  );
  
  const { mutate, isPending } = useCreateBatch();
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  const { data: branchesResponse, isLoading: branchesLoading } = useBranches();
  
  // 2. DYNAMIC FETCH: Only fetch instructors for the selected branch!
  const { data: instructorsResponse, isLoading: instructorsLoading } = useUsers(
    1, 100, 
    { 
      role: "instructor", 
      ...(selectedBranch ? { branch: selectedBranch } : {}) 
    }
  );

  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ 
      value: b._id, 
      label: b.branch_name 
    }));
  }, [branchesResponse]);

  const courseOptions = useMemo(() => {
    const coursesArray = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse?.data;
    return coursesArray?.map((c) => ({ value: c._id, label: c.course_name })) || [];
  }, [coursesResponse]);

  // 3. MAP INSTRUCTORS: Format them for the checkbox-group
  const instructorOptions = useMemo(() => {
    let instructorsArray = instructorsResponse?.data || [];
    
    // Strict safety filter to guarantee no cross-campus contamination
    if (selectedBranch) {
      instructorsArray = instructorsArray.filter(
        inst => inst.branch === selectedBranch || inst.branch?._id === selectedBranch
      );
    }

    return instructorsArray.map((inst) => ({
      value: inst._id,
      label: inst.full_name, // This will show their name next to the checkbox
    }));
  }, [instructorsResponse, selectedBranch]);

  const batchConfig = [
    {
      name: "batch_name",
      label: "Batch Title",
      placeholder: "e.g. Morning Professional Intake",
      required: true,
    },
    
    // ADMIN BRANCH SELECTOR
    ...(authUser?.role === "admin" ? [{
      name: "branch",
      label: "Campus / Location",
      type: "select",
      options: branchOptions,
      required: true,
      defaultOption: "Select Campus",
      // 4. TRIGGER: When Admin changes branch, update state to reveal teachers
      onChange: (e) => {
        const val = e?.target ? e.target.value : e; 
        setSelectedBranch(val);
      }
    }] : []),

    {
      name: "course",
      label: "Associated Course",
      type: "select",
      options: courseOptions,
      required: true,
      defaultOption: "Select Course",
    },

    // 5. CONDITIONAL INSTRUCTORS LIST (MULTIPLE SELECT)
    // This ONLY appears after a branch is selected. 
    // "checkbox-group" allows selecting multiple teachers one by one on a new line.
    ...(selectedBranch ? [{
      name: "instructors",
      label: "Assign Instructors (Select all that apply)",
      type: "checkbox-group", 
      options: instructorOptions,
      required: true, 
    }] : []),

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
        { value: "Friday", label: "Friday" },
      ],
      required: true,
    },

    { name: "start_time", label: "Class Start Time", type: "time", required: true },
    { name: "end_time", label: "Class End Time", type: "time", required: true },
    { name: "start_date", label: "Official Start Date", type: "date", required: true },
    {
      name: "status",
      label: "Initial Status",
      type: "select",
      options: [
        { value: "Upcoming", label: "Upcoming" },
        { value: "Active", label: "Active" },
      ],
    },
  ];

 const handleSubmit = (formData, jsonPayload) => {
  // 1. Extract the flat time fields
  const { start_time, end_time, ...restOfPayload } = jsonPayload;

  // 2. Reconstruct the payload to match the Backend Joi Schema
  const finalPayload = {
    ...restOfPayload,
    time_slot: {
      start_time,
      end_time
    },
    // Ensure branch is included if the user is not an admin
    branch: authUser?.role !== "admin" ? authUser?.branch : restOfPayload.branch
  };

  mutate(finalPayload, { 
    onSuccess: () => navigate("/admin/manage-batches") 
  });
};

  if (coursesLoading || branchesLoading) return <Loader />;

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