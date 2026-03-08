import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAddStudent, useUpdateStudent } from "../../hooks/useStudents.js";
import { useActiveCourses } from "../../hooks/useCourses.js";
import { useBatches } from "../../hooks/useBatches.js";
import { useBranches } from "../../hooks/useBranches.js";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader.jsx";
import EntityForm from "../../components/common/EntityForm.jsx";
import Swal from "sweetalert2";
import { getStudentFormSchema } from "../../validators/zodSchemas.js";

const buildStudentPayload = (baseFormData, jsonPayload, courses) => {
  const selectedCourseId = jsonPayload.course;
  const courseDetails = courses.find((c) => c._id === selectedCourseId);

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

  const context = useOutletContext() || {};
  const branchId = context?.branchId || authUser?.branch?._id || authUser?.branch;

  const roleName = typeof authUser?.role === "string" ? authUser.role : authUser?.role?.name;
  const isMaster = roleName === "superadmin" || authUser?.permissions?.includes("all_access");

  const [selectedBranch, setSelectedBranch] = useState(
    data?.branch?._id || data?.branch || branchId || "",
  );

  useEffect(() => {
    if (mode === "add" && branchId && !selectedBranch) {
      setSelectedBranch(branchId);
    }
  }, [branchId, mode, selectedBranch]);

  const queryFilter = selectedBranch ? { branch: selectedBranch } : {};

  // FIX: Directly receiving clean Arrays and Objects
  const { data: courses = [], isFetching: coursesFetching, error: coursesError } = useActiveCourses(queryFilter);
  const { data: batchesRes, isFetching: batchesFetching, error: batchesError } = useBatches(queryFilter);
  const { data: branches = [] } = useBranches();

  const addStudentMutation = useAddStudent();
  const editStudentMutation = useUpdateStudent();

  // FIX: Super clean useMemo hooks. No Array.isArray needed!
  const branchOptions = useMemo(() => {
    let availableBranches = branches;
    if (!isMaster && branchId) {
      availableBranches = availableBranches.filter((b) => b._id === branchId);
    }
    return availableBranches.map((b) => ({
      value: b._id,
      label: `${b.branch_name} (${b.branch_code})`,
    }));
  }, [branches, isMaster, branchId]);

  const courseOptions = useMemo(() => {
    return courses.map((c) => ({ value: c._id, label: c.course_name }));
  }, [courses]);

  const batchOptions = useMemo(() => {
    // Batches has pagination, so we extract from .data
    const allBatches = batchesRes?.data || [];
    return allBatches.map((b) => ({
      value: b._id,
      label: `${b.batch_name} (${b.course?.course_name || "N/A"})`,
    }));
  }, [batchesRes]);

  const today = new Date().toISOString().split("T")[0];

  const initialData = useMemo(() => {
    if (mode === "edit" && data) {
      return {
        ...data,
        course: data.course?._id || data.course || "",
        batch: data.batch?._id || data.batch || "",
        issue_date: data.issue_date?.split("T")[0] || "",
        completion_date: data.completion_date?.split("T")[0] || "",
        branch: data.branch?._id || data.branch || branchId,
      };
    }
    return {
      student_name: "",
      fathers_name: "",
      student_id: "",
      registration_number: "",
      gender: "male",
      course: "",
      batch: "",
      issue_date: today,
      contact_number: "",
      email: "",
      address: "",
      branch: branchId || "",
    };
  }, [mode, data, branchId, today]);

  // Dynamic Fields based on Mode
  const editOnlyFields =
    mode === "edit"
      ? [
          {
            name: "competency",
            label: "Competency",
            type: "select",
            options: [
              { value: "competent", label: "Competent" },
              { value: "incompetent", label: "Incompetent" },
              { value: "not_assessed", label: "Not Assessed" },
            ],
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "completed", label: "Completed" },
            ],
          },
          { name: "completion_date", label: "Completion Date", type: "date" },
          { divider: true, name: "divider-sys", title: "System Details" },
          { name: "is_active", label: "Account Active", type: "checkbox" },
          { name: "is_verified", label: "Student Verified", type: "checkbox" },
        ]
      : [];

  const studentConfig = [
    { name: "student_name", label: "Student Name", required: true },
    { name: "fathers_name", label: "Father's Name", required: true },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    { divider: true, name: "divider-academic", title: "Academic Information" },
    {
      name: "branch",
      label: isMaster ? "Assigned Campus" : "Assigned Campus (Locked)",
      type: "select",
      options: branchOptions,
      required: true,
      disabled: !isMaster,
      onChange: (e) => setSelectedBranch(e?.target ? e.target.value : e),
    },
    { name: "student_id", label: "Student ID", required: true },
    { name: "registration_number", label: "Registration Number" },
    {
      name: "course",
      label: "Course",
      type: "select",
      defaultOption: coursesFetching ? "Loading courses..." : "Select a course...",
      options: courseOptions,
      required: true,
    },
    {
      name: "batch",
      label: "Batch",
      type: "select",
      defaultOption: batchesFetching ? "Loading batches..." : "Select a batch...",
      options: batchOptions,
      required: true,
    },

    { divider: true, name: "divider-contact", title: "Contact Information" },
    { name: "issue_date", label: "Issue Date", type: "date", required: true },
    { name: "contact_number", label: "Contact Number", type: "tel" },
    { name: "email", label: "Email Address", type: "email" },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      fullWidth: true,
      placeholder: "Enter full address",
    },
    { name: "photo", label: "Student Photo", type: "file" },

    ...editOnlyFields,
  ];

  const handleSubmit = (formData, jsonPayload) => {
    const finalBranch = !isMaster && branchId ? branchId : selectedBranch || jsonPayload.branch;
    jsonPayload.branch = finalBranch;

    const schema = getStudentFormSchema(mode);
    const validationResult = schema.safeParse(jsonPayload);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0].message;
      Swal.fire({
        icon: "error",
        title: "Validation Failed",
        text: firstError,
      });
      return;
    }

    // Passed 'courses' directly here
    const finalPayload = buildStudentPayload(formData, jsonPayload, courses);
    finalPayload.set("branch", finalBranch);

    if (mode === "add") {
      finalPayload.delete("is_active");
      finalPayload.delete("is_verified");
      finalPayload.delete("status");
      finalPayload.delete("competency");
    }

    const mutationConfig = { onSuccess: () => navigate("/admin/all-students") };

    if (mode === "edit") {
      editStudentMutation.mutate({ id: data._id, formData: finalPayload }, mutationConfig);
    } else {
      addStudentMutation.mutate(finalPayload, mutationConfig);
    }
  };

  const isMutating = addStudentMutation.isPending || editStudentMutation.isPending;

  if (!branchId && !isMaster) return <Loader />;
  if (coursesError || batchesError)
    return (
      <div className="p-6 text-red-600 font-bold bg-red-50 rounded-xl text-center">
        Error loading academic records. Please refresh the page.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#e8f0f2] py-8 px-4 animate-in fade-in duration-300">
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