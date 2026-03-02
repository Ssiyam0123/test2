import React, { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAddUser, useUpdateUser } from "../../hooks/useUser.js";
import { useBranches } from "../../hooks/useBranches.js"; 
import { useRoles } from "../../hooks/useRoles.js"; // 🚀 1. IMPORT ROLE HOOK
import EntityForm from "../../components/common/EntityForm.jsx";
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader.jsx";

const AddEmployeeForm = ({ mode = "add", data = null }) => {
  const navigate = useNavigate();
  const { authUser } = useAuth(); 
  
  const context = useOutletContext() || {};
  const { branchId } = context;

  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  
  // 🚀 2. FETCH DATA
  const { data: branchesResponse } = useBranches(); 
  const { data: rolesResponse } = useRoles(); 

  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ 
      value: b._id, 
      label: b.branch_name 
    }));
  }, [branchesResponse]);

  // 🚀 3. GENERATE DYNAMIC ROLE OPTIONS
  const roleOptions = useMemo(() => {
    if (!rolesResponse?.data) return [];
    
    // Check if current user is a master admin
    const isMaster = authUser?.permissions?.includes("all_access") || authUser?.role === "superadmin" || authUser?.role?.name === "superadmin";

    return rolesResponse.data
      // Security Check: Hide Master/Superadmin roles from standard Branch Admins in the dropdown
      .filter(role => isMaster ? true : (!role.permissions.includes("all_access") && role.name !== "superadmin"))
      .map(role => ({
        value: role._id, // We must send the ObjectId to the backend!
        label: role.name.charAt(0).toUpperCase() + role.name.slice(1) // Capitalizes the name nicely
      }));
  }, [rolesResponse, authUser]);

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
    // 🚀 4. EXTRACT OBJECT ID SAFELY
    role: data.role?._id || data.role || "", 
    facebook: data.social_links?.facebook || "",
    linkedin: data.social_links?.linkedin || "",
    twitter: data.social_links?.twitter || "",
    instagram: data.social_links?.instagram || "",
    others: data.social_links?.others || "", 
    photo_url: data.photo_url || "",
    branch: data.branch?._id || data.branch || branchId 
  } : {
    employee_id: "", full_name: "", email: "", phone: "", designation: "", department: "",
    joining_date: "", status: "Active", username: "", 
    password: mode === "add" ? "123456" : "", 
    role: "", // Blank default forces them to select from the dropdown
    facebook: "", linkedin: "", twitter: "", instagram: "", others: "",
    branch: branchId 
  };

  const employeeConfig = [
    { divider: true, name: "div-basic", title: "Basic Information" },
    { name: "full_name", label: "Full Name", required: true },
    { name: "employee_id", label: "Employee ID", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Contact Number", type: "tel", required: true },

    { divider: true, name: "div-job", title: "Job Details" },
    
    { 
      name: "branch", 
      label: authUser?.role === "superadmin" || authUser?.role?.name === "superadmin" ? "Assigned Campus" : "Assigned Campus (Locked)", 
      type: "select", 
      options: branchOptions, 
      required: true,
      disabled: authUser?.role !== "superadmin" && authUser?.role?.name !== "superadmin"
    },

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
    
    // 🚀 5. USE THE DYNAMIC OPTIONS IN THE FORM
    { 
      name: "role", 
      label: "System Access Role", 
      type: "select", 
      required: true, 
      defaultOption: "Select Access Level...",
      options: roleOptions 
    },

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
    
    const isMaster = authUser?.permissions?.includes("all_access") || authUser?.role === "superadmin" || authUser?.role?.name === "superadmin";

    if (!isMaster && branchId) {
      formData.set("branch", branchId);
    } else if (!formData.get("branch") && branchId) {
      formData.set("branch", branchId); 
    }
    
    const mutationConfig = { onSuccess: () => navigate("/admin/all-employees") };
    
    if (mode === "edit") {
      updateUserMutation.mutate({ id: data._id, formData }, mutationConfig);
    } else {
      addUserMutation.mutate(formData, mutationConfig);
    }
  };

  const isMutating = addUserMutation.isPending || updateUserMutation.isPending;

  if (!branchId) return <Loader />;

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