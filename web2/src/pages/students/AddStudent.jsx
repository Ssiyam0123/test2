import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAddStudent, useUpdateStudent } from "../../hooks/useStudents.js";
import { useActiveCourses } from "../../hooks/useCourses.js";
import { useActiveBatches } from "../../hooks/useBatches.js"; 
import { useBranches } from "../../hooks/useBranches.js"; // IMPORT THIS
import useAuth from "../../store/useAuth"; // IMPORT THIS
import Loader from "../../components/Loader.jsx";
import EntityForm from "../../components/common/EntityForm.jsx";

const buildStudentPayload = (baseFormData, jsonPayload, coursesData) => {
  const selectedCourseId = jsonPayload.course;
  const courseDetails = coursesData?.data?.find(c => c._id === selectedCourseId);

  if (courseDetails) {
    baseFormData.append("course_name", courseDetails.course_name);
    baseFormData.append("course_code", courseDetails.course_code || "N/A"); 
    if (courseDetails.duration) {
       baseFormData.append("course_duration[value]", courseDetails.duration.value);
       baseFormData.append("course_duration[unit]", courseDetails.duration.unit);
    } else {
       baseFormData.append("course_duration[value]", 3);
       baseFormData.append("course_duration[unit]", "months");
    }
  }
  return baseFormData;
};

const AddStudentForm = ({ mode = "add", data = null }) => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useActiveCourses();
  const { data: batchesData, isLoading: batchesLoading, error: batchesError } = useActiveBatches();
  const { data: branchesResponse, isLoading: branchesLoading } = useBranches(); // Fetch branches
  
  const addStudentMutation = useAddStudent();
  const editStudentMutation = useUpdateStudent();

  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ 
      value: b._id, 
      label: `${b.branch_name} (${b.branch_code})` 
    }));
  }, [branchesResponse]);

  const courseOptions = useMemo(() => {
    const activeCourses = coursesData?.data || [];
    return activeCourses.map((c) => ({ value: c._id, label: c.course_name }));
  }, [coursesData]);

  const batchOptions = useMemo(() => {
    const allBatches = batchesData?.data || [];
    return allBatches.map((b) => ({ 
      value: b._id, 
      label: `${b.batch_name} (${b.course?.course_name || 'N/A'})` 
    }));
  }, [batchesData]);

  const initialData = mode === "edit" && data ? {
    ...data,
    course: data.course?._id || data.course || "", 
    batch: data.batch?._id || data.batch || "", 
    branch: data.branch?._id || data.branch || "", // ADDED THIS
    issue_date: data.issue_date?.split("T")[0] || "",
    completion_date: data.completion_date?.split("T")[0] || "",
  } : {
    student_name: "", fathers_name: "", student_id: "", registration_number: "",
    gender: "male", course: "", competency: "not_assessed", batch: "", branch: "", status: "active",
    issue_date: "", completion_date: "", contact_number: "", email: "", address: "",
    is_active: true, is_verified: false,
  };

  const studentConfig = [
    { name: "student_name", label: "Student Name", required: true },
    { name: "fathers_name", label: "Father's Name", required: true },
    { name: "gender", label: "Gender", type: "select", required: true, options: [
      { value: "male", label: "Male" }, { value: "female", label: "Female" }
    ]},
    
    { divider: true, name: "divider-academic", title: "Academic Information" }, 

    // CONDITIONAL BRANCH FIELD
    ...(authUser?.role === "admin" ? [{
      name: "branch",
      label: "Assigned Campus",
      type: "select",
      options: branchOptions,
      required: true,
      defaultOption: "Select Campus",
    }] : []),

    { name: "student_id", label: "Student ID", required: true },
    { name: "registration_number", label: "Registration Number" },
    { name: "course", label: "Course", type: "select", defaultOption: "Select a course...", options: courseOptions, required: true },
    { name: "batch", label: "Batch", type: "select", defaultOption: "Select a batch...", options: batchOptions, required: true },
    
    { name: "competency", label: "Competency", type: "select", options: [
      { value: "competent", label: "Competent" }, { value: "incompetent", label: "Incompetent" }, { value: "not_assessed", label: "Not Assessed" }
    ]},
    { name: "status", label: "Status", type: "select", options: [
      { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "completed", label: "Completed" }
    ]},

    { divider: true, name: "divider-contact", title: "Contact Information" },

    { name: "issue_date", label: "Issue Date", type: "date", required: true },
    { name: "completion_date", label: "Completion Date", type: "date" },
    { name: "contact_number", label: "Contact Number", type: "tel" },
    { name: "email", label: "Email Address", type: "email" },
    { name: "address", label: "Address", type: "textarea", fullWidth: true, placeholder: "Enter full address" },
    
    { divider: true, name: "divider-sys", title: "System Details" },

    { name: "photo", label: "Student Photo", type: "file" },
    { name: "is_active", label: "Account Active", type: "checkbox" },
    { name: "is_verified", label: "Student Verified", type: "checkbox" },
  ];

  const handleSubmit = (formData, jsonPayload) => {
    const finalPayload = buildStudentPayload(formData, jsonPayload, coursesData);
    const mutationConfig = { onSuccess: () => navigate("/admin/all-students") };
    
    if (mode === "edit") {
      editStudentMutation.mutate({ id: data._id, formData: finalPayload }, mutationConfig);
    } else {
      addStudentMutation.mutate(finalPayload, mutationConfig);
    }
  };

  const isMutating = addStudentMutation.isPending || editStudentMutation.isPending;
  const isLoading = coursesLoading || batchesLoading || branchesLoading;

  if (isLoading) return <Loader />;
  if (coursesError || batchesError) return <div className="p-6 text-red-600">Error loading data. Please refresh.</div>;

  return (
    <div className="min-h-screen bg-[#e8f0f2] py-8 px-4">
      <EntityForm
        key={data?._id || "new"}
        title={mode === "edit" ? "Edit Student Profile" : "Register New Student"}
        subtitle={`Fill out the information below to ${mode === "edit" ? "update" : "create"} a student record.`}
        config={studentConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        buttonText={mode === "edit" ? "Save Changes" : "Register Student"}
        mode={mode}
        onCancel={() => navigate("/admin/all-students")}
      />
    </div>
  );
};

export default AddStudentForm;