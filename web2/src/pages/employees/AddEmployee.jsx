import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAddUser, useUpdateUser } from "../../hooks/useUser.js";
import { useBranches } from "../../hooks/useBranches.js"; 
import { useRoles } from "../../hooks/useRoles.js"; 
import EntityForm from "../../components/common/EntityForm.jsx";
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader.jsx";
import Swal from "sweetalert2"; 
import { getEmployeeFormSchema } from "../../validators/zodSchemas.js"; // 🚀 Zod Import

const AddEmployeeForm = ({ mode = "add", data = null, isLoading }) => {
  const navigate = useNavigate();
  const { authUser } = useAuth(); 
  
  const context = useOutletContext() || {};
  const { branchId } = context;

  const addUserMutation = useAddUser();
  const updateUserMutation = useUpdateUser();
  
  const { data: branchesResponse, isFetching: branchesFetching } = useBranches(); 
  const { data: rolesResponse, isFetching: rolesFetching } = useRoles(); 

  // 🚀 Added Local State for Branch just like StudentForm to prevent unmounting
  const [selectedBranch, setSelectedBranch] = useState(
    data?.branch?._id || data?.branch || branchId
  );

  useEffect(() => {
    if (mode === "add" && branchId) {
      setSelectedBranch(branchId);
    }
  }, [branchId, mode]);

  const branchOptions = useMemo(() => {
    if (!branchesResponse?.data) return [];
    return branchesResponse.data.map(b => ({ value: b._id, label: b.branch_name }));
  }, [branchesResponse]);

  const roleOptions = useMemo(() => {
    if (!rolesResponse?.data) return [];
    const userRole = (typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name || "").toLowerCase();
    const isMaster = authUser?.permissions?.includes("all_access") || userRole === "superadmin";

    return rolesResponse.data
      .filter(role => {
        if (isMaster) return true;
        const targetRoleName = role.name.toLowerCase();
        const isAdminRole = targetRoleName.includes("admin") || role.permissions.includes("all_access");
        return !isAdminRole; 
      })
      .map(role => ({ value: role._id, label: role.name.charAt(0).toUpperCase() + role.name.slice(1) }));
  }, [rolesResponse, authUser]);

  // 🚀 FIXED: useMemo diye wrap kora holo jate Form data reset na hoy!
  const initialData = useMemo(() => {
    if (mode === "edit" && data) {
      return {
        employee_id: data.employee_id || "", full_name: data.full_name || "", email: data.email || "",
        phone: data.phone || "", designation: data.designation || "", department: data.department || "",
        joining_date: data.joining_date ? data.joining_date.split("T")[0] : "", status: data.status || "Active",
        username: data.username || "", password: "", role: data.role?._id || data.role || "", 
        facebook: data.social_links?.facebook || "", linkedin: data.social_links?.linkedin || "",
        twitter: data.social_links?.twitter || "", instagram: data.social_links?.instagram || "",
        others: data.social_links?.others || "", photo_url: data.photo_url || "",
        branch: data.branch?._id || data.branch || branchId 
      };
    }
    return {
      employee_id: "", full_name: "", email: "", phone: "", designation: "", department: "",
      joining_date: "", status: "Active", username: "", password: mode === "add" ? "123456" : "", 
      role: "", facebook: "", linkedin: "", twitter: "", instagram: "", others: "", 
      branch: branchId || "" 
    };
  }, [mode, data, branchId]);

  const isMaster = authUser?.permissions?.includes("all_access") || authUser?.role === "superadmin" || authUser?.role?.name === "superadmin";

  const employeeConfig = [
    { divider: true, name: "div-basic", title: "Basic Information" },
    { name: "full_name", label: "Full Name", required: true },
    { name: "employee_id", label: "Employee ID", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "phone", label: "Contact Number", type: "tel", required: true },
    
    { divider: true, name: "div-job", title: "Job Details" },
    { 
      name: "branch", 
      label: isMaster ? "Assigned Campus" : "Assigned Campus (Locked)", 
      type: "select", 
      options: branchOptions, 
      required: true,
      disabled: !isMaster,
      onChange: (e) => setSelectedBranch(e?.target ? e.target.value : e) // Local state update
    },
    { name: "department", label: "Department", type: "select", defaultOption: "Select Department...", required: true, options: [
      { value: "Faculty", label: "Faculty / Instructor" }, { value: "Administration", label: "Administration" }, 
      { value: "Management", label: "Management" }, { value: "Support Staff", label: "Support Staff" }
    ]},
    { name: "designation", label: "Designation / Job Title", placeholder: "e.g. Senior Culinary Instructor", required: true },
    { name: "joining_date", label: "Joining Date", type: "date" },
    
    ...(mode === "edit" ? [{ 
      name: "status", label: "Employment Status", type: "select", options: [
        { value: "Active", label: "Active" }, { value: "On Leave", label: "On Leave" }, { value: "Resigned", label: "Resigned" }
      ]
    }] : []),

    { divider: true, name: "div-credentials", title: "Account Credentials" },
    { name: "username", label: "Username", required: true },
    { 
      name: "password", 
      label: mode === "edit" ? "New Password (Optional)" : "Password", 
      type: "text", 
      placeholder: mode === "add" ? "123456" : "Leave blank to keep current",
      required: mode === "add" 
    },
    { name: "role", label: "System Access Role", type: "select", required: true, defaultOption: rolesFetching ? "Loading Roles..." : "Select Access Level...", options: roleOptions },
    
    { divider: true, name: "div-social", title: "Social Links (Optional)" },
    { name: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
    { name: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/..." },
    { name: "twitter", label: "Twitter (X) URL", placeholder: "https://twitter.com/..." },
    { name: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
    { name: "others", label: "Other Link (Portfolio/Website)", placeholder: "https://..." },
    { name: "photo", label: "Employee Photo", type: "file" }
  ];

  const handleSubmit = (formData, jsonPayload) => {
    // 🚀 Branch injection for JSON Payload
    const finalBranch = (!isMaster && branchId) ? branchId : (selectedBranch || jsonPayload.branch);
    jsonPayload.branch = finalBranch;

    // 🛡️ FRONTEND ZOD VALIDATION
    const schema = getEmployeeFormSchema(mode);
    const validationResult = schema.safeParse(jsonPayload);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0].message;
      Swal.fire({ icon: "error", title: "Validation Failed", text: firstError });
      return; 
    }

    // 🚀 Prepare FormData
    if (mode === "edit" && !formData.get("password")) formData.delete("password");
    if (mode === "add" && !formData.get("joining_date")) formData.delete("joining_date");
    
    formData.set("branch", finalBranch);
    
    const mutationConfig = { onSuccess: () => navigate("/admin/all-employees") };
    
    if (mode === "edit") {
      updateUserMutation.mutate({ id: data._id, formData }, mutationConfig);
    } else {
      addUserMutation.mutate(formData, mutationConfig);
    }
  };

  const isMutating = addUserMutation.isPending || updateUserMutation.isPending;

  // Shudhu first time jokhon branch thakbena tokhon loader dibe
  if (!branchId || (isLoading && mode === "edit")) return <Loader />;

  return (
    <div className="min-h-screen py-8 px-4 animate-in fade-in duration-300">
      <EntityForm
        key={data?._id || "new-emp"}
        title={mode === "edit" ? "Edit Employee Profile" : "Register New Employee"}
        subtitle={`Fill out the information below to ${mode === "edit" ? "update" : "create"} an employee record.`}
        config={employeeConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        buttonText={mode === "edit" ? "Save Changes" : "Register Employee"}
        mode={mode}
        onCancel={() => navigate("/admin/all-employees")}
        buttonColor="bg-[#1e293b] hover:bg-slate-800"
      />
    </div>
  );
};

export default AddEmployeeForm;