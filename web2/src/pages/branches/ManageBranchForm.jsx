import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useCreateBranch, useUpdateBranch, useBranch } from "../../hooks/useBranches";
import { Loader2 } from "lucide-react"; // For a quick loading spinner

const ManageBranchForm = ({ mode = "add" }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // 1. Grab the ID from the URL (e.g., /admin/update-branch/123)

  // 2. Fetch the branch data if we are in edit mode
  const { data: branchResponse, isLoading: isFetching } = useBranch(id);
  
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();

  // The actual data from the API response
  const branchData = branchResponse?.data; 

  // 3. WAIT FOR DATA: Do not render the form until the data has finished loading!
  if (mode === "edit" && isFetching) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
      </div>
    );
  }

  // 4. Safe Initialization (Now uses branchData from the API instead of props)
  const initialData = mode === "edit" && branchData ? {
    branch_name: branchData.branch_name || "",
    branch_code: branchData.branch_code || "",
    address: branchData.address || "",
    contact_email: branchData.contact_email || "",
    contact_phone: branchData.contact_phone || "",
    is_active: branchData.is_active !== undefined ? branchData.is_active : true,
  } : {
    branch_name: "",
    branch_code: "",
    address: "",
    contact_email: "",
    contact_phone: "",
    is_active: true,
  };

  // 5. Define Form Structure
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
        title: "Used to generate unique Student and Employee IDs.",
        // Make the code read-only during edit so users don't break existing IDs
        disabled: mode === "edit" 
      }
    },
    { divider: true, name: "div-contact", title: "Location & Contact Details" },
    { 
      name: "address", 
      label: "Physical Address", 
      type: "textarea", 
      fullWidth: true, 
      placeholder: "Full street address, City, Postal Code...",
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

  // 6. Handle Submission
  const handleSubmit = (formData, rawJsonData) => {
    const config = {
      onSuccess: () => navigate("/admin/branches"),
    };

    const cleanPayload = {
      branch_name: rawJsonData.branch_name,
      branch_code: rawJsonData.branch_code,
      address: rawJsonData.address,
      contact_phone: rawJsonData.contact_phone,
      contact_email: rawJsonData.contact_email,
      is_active: rawJsonData.is_active,
    };

    if (mode === "edit") {
      // Use the ID we got from the URL params
      updateBranchMutation.mutate({ id: id, formData: cleanPayload }, config);
    } else {
      createBranchMutation.mutate(cleanPayload, config);
    }
  };

  const isMutating = createBranchMutation.isPending || updateBranchMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4 sm:px-6 lg:px-8">
      <EntityForm
        // Key forces React to rebuild the form once the data arrives from the API
        key={mode === "edit" ? `edit-${id}` : "new-branch"} 
        title={mode === "edit" ? "Edit Branch Config" : "Establish New Branch"}
        subtitle={mode === "edit" ? "Modify location details and system access." : "Register a new campus into the CIB network."}
        config={branchConfig}
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        buttonText={mode === "edit" ? "Save Changes" : "Create Branch"}
        mode={mode}
        onCancel={() => navigate("/admin/branches")}
        buttonColor="bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
      />
    </div>
  );
};

export default ManageBranchForm;