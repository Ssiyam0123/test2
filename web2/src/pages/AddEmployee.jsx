import React from "react";
import { useNavigate } from "react-router-dom";
import { useAddUser, useUpdateUser } from "../hooks/useUser.js";
import EntityForm from "../components/common/EntityForm.jsx";

const AddEmployeeForm = ({ mode = "add", data = null }) => {
  const navigate = useNavigate();
  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();

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
    password: "", // Keep empty to not overwrite unless typed
    role: data.role || "staff",
    facebook: data.social_links?.facebook || "",
    linkedin: data.social_links?.linkedin || "",
    twitter: data.social_links?.twitter || "",
    instagram: data.social_links?.instagram || "",
    photo_url: data.photo_url || "" // For preview
  } : {
    employee_id: "", full_name: "", email: "", phone: "", designation: "", department: "",
    joining_date: "", status: "Active", username: "", 
    password: mode === "add" ? "123456" : "", // Default password for new users
    role: "staff", facebook: "", linkedin: "", twitter: "", instagram: "",
  };

  // Define the form structure using blocks
  const employeeConfig = [
    // Block 1: Basic Information
    { divider: true, name: "div-basic", title: "Basic Information" },
    { name: "full_name", label: "Full Name", required: true },
    { name: "employee_id", label: "Employee ID", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Contact Number", type: "tel", required: true },

    // Block 2: Job Details
    { divider: true, name: "div-job", title: "Job Details" },
    { name: "department", label: "Department", type: "select", defaultOption: "Select Department...", required: true, options: [
      { value: "Faculty", label: "Faculty / Instructor" }, { value: "Administration", label: "Administration" }, { value: "Management", label: "Management" }, { value: "Support Staff", label: "Support Staff" }
    ]},
    { name: "designation", label: "Designation / Job Title", placeholder: "e.g. Senior Culinary Instructor", required: true },
    { name: "joining_date", label: "Joining Date", type: "date" },
    { name: "status", label: "Employment Status", type: "select", options: [
      { value: "Active", label: "Active" }, { value: "On Leave", label: "On Leave" }, { value: "Resigned", label: "Resigned" }
    ]},

    // Block 3: Account Credentials
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
      { value: "staff", label: "General Staff" }, { value: "instructor", label: "Instructor" }, { value: "register", label: "Registrar" }, { value: "admin", label: "Administrator" }
    ]},

    // Block 4: Social Links
    { divider: true, name: "div-social", title: "Social Links (Optional)" },
    { name: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
    { name: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
    { name: "twitter", label: "Twitter (X) URL", placeholder: "https://twitter.com/..." },
    { name: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },

    // Photo
    { name: "photo", label: "Employee Photo", type: "file" }
  ];

  const handleSubmit = (formData) => {
    // If edit mode and password is blank, remove it so backend doesn't overwrite
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
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
        buttonColor="bg-[#000c1d] hover:bg-slate-800 focus:ring-slate-200" // Custom color from your original code
      />
    </div>
  );
};

export default AddEmployeeForm;