import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useCreateBatch } from "../../hooks/useBatches";
import { useCourses } from "../../hooks/useCourses";
import { useBranches } from "../../hooks/useBranches"; 
import { useUsers } from "../../hooks/useUser"; 
import { useRoles } from "../../hooks/useRoles"; // 🚀 Import roles hook
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader";

const AddBatch = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  // 🚀 1. Robust PBAC Check
  const roleName = typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name;
  const isMaster = roleName === "superadmin" || authUser?.permissions?.includes("all_access");
  
  // If Master: Starts empty. If Staff: Starts with their assigned branch.
  const [selectedBranch, setSelectedBranch] = useState(
    !isMaster ? (typeof authUser?.branch === 'object' ? authUser?.branch?._id : authUser?.branch) : ""
  );
  
  const { mutate, isPending } = useCreateBatch();
  const { data: coursesResponse, isLoading: coursesLoading } = useCourses();
  const { data: branchesResponse, isLoading: branchesLoading } = useBranches();
  
  // 🚀 2. Fetch Roles to get the actual ObjectId for "Instructor"
  const { data: rolesResponse } = useRoles();
  const instructorRoleId = useMemo(() => {
     if (!rolesResponse?.data) return null;
     const instructorRole = rolesResponse.data.find(r => r.name.toLowerCase() === "instructor");
     return instructorRole?._id;
  }, [rolesResponse]);

  // 3. DYNAMIC FETCH: Only fetch instructors for the selected branch using the true Role ID!
  const { data: instructorsResponse, isLoading: instructorsLoading } = useUsers(
    1, 100, 
    { 
      ...(instructorRoleId ? { role: instructorRoleId } : {}), 
      ...(selectedBranch ? { branch: selectedBranch } : {}) 
    },
    { enabled: !!instructorRoleId && !!selectedBranch } // Only fetch when both IDs are ready
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

  // 4. MAP INSTRUCTORS: Format them for the checkbox-group
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
      label: inst.full_name, 
    }));
  }, [instructorsResponse, selectedBranch]);

  const batchConfig = [
    {
      name: "batch_name",
      label: "Batch Title",
      placeholder: "e.g. Morning Professional Intake",
      required: true,
    },
    
    // 🚀 5. MASTER BRANCH SELECTOR
    ...(isMaster ? [{
      name: "branch",
      label: "Campus / Location",
      type: "select",
      options: branchOptions,
      required: true,
      defaultOption: "Select Campus",
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

    // 6. CONDITIONAL INSTRUCTORS LIST (MULTIPLE SELECT)
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
    const { start_time, end_time, ...restOfPayload } = jsonPayload;

    const finalPayload = {
      ...restOfPayload,
      time_slot: {
        start_time,
        end_time
      },
      // Ensure branch is included if the user is not a master admin
      branch: !isMaster ? (typeof authUser?.branch === 'object' ? authUser?.branch?._id : authUser?.branch) : restOfPayload.branch
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