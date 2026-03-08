import React, { useMemo } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useCreateBranch, useUpdateBranch, useBranch } from "../../hooks/useBranches";
import useAuth from "../../store/useAuth"; 
import Loader from "../../components/Loader";
import { PERMISSIONS } from "../../config/permissionConfig";

const ManageBranchForm = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isMaster, hasPermission } = useAuth();

  // ROLE-BASED ACCESS CONTROL (RBAC)
  // Only users who are superadmin or have manage_branches permission can access this page
  const canAccess = isMaster() || hasPermission(PERMISSIONS.MANAGE_BRANCHES);

  // CLEAN DATA FETCHING: Receiving object directly
  const { data: branchData, isLoading: isFetching } = useBranch(mode === "edit" ? id : null);
  
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  // Safe Initial Data (Memoized for stability)
  const initialData = useMemo(() => {
    if (mode === "edit" && branchData) {
      return {
        branch_name: branchData.branch_name || "",
        branch_code: branchData.branch_code || "",
        address: branchData.address || "",
        contact_email: branchData.contact_email || "",
        contact_phone: branchData.contact_phone || "",
        is_active: branchData.is_active ?? true,
      };
    }
    return {
      branch_name: "",
      branch_code: "",
      address: "",
      contact_email: "",
      contact_phone: "",
      is_active: true,
    };
  }, [mode, branchData]);

  // Redirect unauthorized users
  if (!canAccess) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Handle Loading State
  if (mode === "edit" && isFetching) return <Loader />;

  // Form Field Configuration
  const branchConfig = [
    { divider: true, name: "div-basic", title: "Branch Identity" },
    { 
      name: "branch_name", 
      label: "Branch Name", 
      placeholder: "e.g., CIB Dhaka Main Campus", 
      required: true 
    },
    { 
      name: "branch_code", 
      label: "Branch Code (Identifier)", 
      placeholder: "e.g., DHK-01", 
      required: true,
      props: { 
        title: "Used to generate unique IDs. Cannot be changed later.",
        disabled: mode === "edit" // Lock code in edit mode
      }
    },
    { divider: true, name: "div-contact", title: "Location & Contact Details" },
    { 
      name: "address", 
      label: "Physical Address", 
      type: "textarea", 
      fullWidth: true, 
      placeholder: "Full street address...",
      required: true 
    },
    { 
      name: "contact_phone", 
      label: "Official Phone Number", 
      type: "tel", 
      placeholder: "+880..." 
    },
    { 
      name: "contact_email", 
      label: "Official Email Address", 
      type: "email", 
      placeholder: "branch@cibdhk.com" 
    },
    { divider: true, name: "div-status", title: "System Status" },
    { 
      name: "is_active", 
      label: "Branch is currently active and operational", 
      type: "checkbox" 
    }
  ];

  const handleSubmit = (formData, rawJsonData) => {
    const config = { onSuccess: () => navigate("/admin/branches") };

    if (mode === "edit") {
      updateBranchMutation.mutate({ id, formData: rawJsonData }, config);
    } else {
      createBranchMutation.mutate(rawJsonData, config);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4 sm:px-6 lg:px-8">
      <EntityForm
        // KEY MAGIC: Forces a full re-render when data arrives
        key={mode === "edit" ? `edit-${branchData?._id}` : "new-branch"} 
        title={mode === "edit" ? "Update Branch Configuration" : "Establish New Branch"}
        subtitle={mode === "edit" ? "Modify operational settings for this campus." : "Register a new physical campus into the network."}
        config={branchConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={createBranchMutation.isPending || updateBranchMutation.isPending}
        buttonText={mode === "edit" ? "Save Changes" : "Deploy Branch"}
        onCancel={() => navigate("/admin/branches")}
        buttonColor="bg-slate-900 hover:bg-indigo-600"
      />
    </div>
  );
};

export default ManageBranchForm;