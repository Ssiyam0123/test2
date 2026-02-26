import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAddUser, useUpdateUser } from "../../hooks/useUser.js";
import { useBranches } from "../../hooks/useBranches.js"; // IMPORT THIS
import EntityForm from "../../components/common/EntityForm.jsx";
import useAuth from "../../store/useAuth"; // IMPORT THIS

const AddEmployeeForm = ({ mode = "add", data = null }) => {
  const navigate = useNavigate();
  const { authUser } = useAuth(); // Get current user
  
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  const { data: branchesResponse } = useBranches(); // Fetch branches

  // Format Branch Options
  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ 
      value: b._id, 
      label: b.branch_name 
    }));
  }, [branchesResponse]);

  // Populate initial data safely
  const initialData = mode === "edit" && data ? {
    employee_id: data.employee_id || "",
    full_name: data.full_name || "",
    email: data.email || "",
    phone: data.phone || "",
    designation: data.designation || "",
    department: data.department || "",
    joining_date: data.joining_date ? data.joining_date.split("T")[0] : "",
    status: data.status || "Active",
    username: data.username || "",
    password: "", 
    role: data.role || "staff",
    branch: data.branch?._id || data.branch || "", // ADDED THIS
    facebook: data.social_links?.facebook || "",
    linkedin: data.social_links?.linkedin || "",
    twitter: data.social_links?.twitter || "",
    instagram: data.social_links?.instagram || "",
    others: data.social_links?.others || "", 
    photo_url: data.photo_url || "" 
  } : {
    employee_id: "", full_name: "", email: "", phone: "", designation: "", department: "",
    joining_date: "", status: "Active", username: "", 
    password: mode === "add" ? "123456" : "", 
    role: "staff", branch: "", facebook: "", linkedin: "", twitter: "", instagram: "", others: "",
  };

  const employeeConfig = [
    { divider: true, name: "div-basic", title: "Basic Information" },
    { name: "full_name", label: "Full Name", required: true },
    { name: "employee_id", label: "Employee ID", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Contact Number", type: "tel", required: true },

    { divider: true, name: "div-job", title: "Job Details" },
    
    // CONDITIONAL BRANCH FIELD
    ...(authUser?.role === "admin" ? [{
      name: "branch",
      label: "Assigned Campus / Branch",
      type: "select",
      options: branchOptions,
      required: true,
      defaultOption: "Select Primary Campus",
    }] : []),

    { name: "department", label: "Department", type: "select", defaultOption: "Select Department...", required: true, options: [
      { value: "Faculty", label: "Faculty / Instructor" }, { value: "Administration", label: "Administration" }, { value: "Management", label: "Management" }, { value: "Support Staff", label: "Support Staff" }
    ]},
    { name: "designation", label: "Designation / Job Title", placeholder: "e.g. Senior Culinary Instructor", required: true },
    { name: "joining_date", label: "Joining Date", type: "date" },
    { name: "status", label: "Employment Status", type: "select", options: [
      { value: "Active", label: "Active" }, { value: "On Leave", label: "On Leave" }, { value: "Resigned", label: "Resigned" }
    ]},

    { divider: true, name: "div-credentials", title: "Account Credentials" },
    { name: "username", label: "Username", required: true },
    { 
      name: "password", 
      label: mode === "edit" ? "New Password (Optional)" : "Password", 
      type: "text", 
      placeholder: mode === "add" ? "123456" : "Leave blank to keep current",
      required: mode === "add" 
    },
    { name: "role", label: "System Role", type: "select", required: true, options: [
      { value: "staff", label: "General Staff" }, { value: "instructor", label: "Instructor" }, { value: "registrar", label: "Registrar" }, { value: "admin", label: "Branch Admin" }
    ]},

    { divider: true, name: "div-social", title: "Social Links (Optional)" },
    { name: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
    { name: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
    { name: "twitter", label: "Twitter (X) URL", placeholder: "https://twitter.com/..." },
    { name: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
    { name: "others", label: "Other Link (Portfolio/Website)", placeholder: "https://..." },

    { name: "photo", label: "Employee Photo", type: "file" }
  ];

  const handleSubmit = (formData) => {
    if (mode === "edit" && !formData.get("password")) {
      formData.delete("password");
    }
    const mutationConfig = { onSuccess: () => navigate("/admin/all-employees") };
    if (mode === "edit") {
      updateUserMutation.mutate({ id: data._id, formData }, mutationConfig);
    } else {
      addUserMutation.mutate(formData, mutationConfig);
    }
  };

  const isMutating = addUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="min-h-screen py-8 px-4">
      <EntityForm
        title={mode === "edit" ? "Edit Employee Profile" : "Register New Employee"}
        subtitle={`Fill out the information below to ${mode === "edit" ? "update" : "create"} an employee record.`}
        config={employeeConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        buttonText={mode === "edit" ? "Save Changes" : "Register Employee"}
        mode={mode}
        onCancel={() => navigate("/admin/all-employees")}
        buttonColor="bg-[#000c1d] hover:bg-slate-800 focus:ring-slate-200"
      />
    </div>
  );
};

export default AddEmployeeForm;