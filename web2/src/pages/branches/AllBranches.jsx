import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Edit3, Trash2, Power, PowerOff,
  MapPin, Phone, Mail, Building2 
} from "lucide-react";
import { 
  useBranches, 
  useToggleBranchStatus, 
  useDeleteBranch 
} from "../../hooks/useBranches.js";
import useAuth from "../../store/useAuth.js";
import { useConfirmToast } from "../../components/ConfirmToast.jsx";
import DataTable from "../../components/common/DataTable.jsx";
import ActionIconButton from "../../components/common/ActionIconButton.jsx";

export default function AllBranches() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const { showConfirmToast } = useConfirmToast();
  
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch branches
  const { data: branchesResponse, isLoading, isError } = useBranches();
  const toggleMutation = useToggleBranchStatus();
  const deleteMutation = useDeleteBranch();

  const branches = branchesResponse?.data || [];
  const isAdmin = authUser?.role === "admin";

  // Client-side filtering
  const filteredBranches = branches.filter((b) => 
    b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.branch_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (branch) => {
    toggleMutation.mutate(branch._id);
  };

  const handleDelete = (branch) => {
    showConfirmToast({
      type: "delete",
      title: "Delete Branch",
      message: `Are you sure you want to permanently delete`,
      itemName: `${branch.branch_name} (${branch.branch_code})?`,
      confirmText: "Delete Branch",
      confirmColor: "red",
      onConfirm: async () => await deleteMutation.mutateAsync(branch._id),
    });
  };

  // Define column constraints for the DataTable
  const columns = [
    { label: "Branch Details", className: "w-[40%] pl-6" },
    { label: "Contact Info", className: "hidden md:table-cell w-[30%]" },
    { label: "Status", className: "text-center w-[15%]" },
    ...(isAdmin ? [{ label: "Actions", align: "right", className: "w-[15%] pr-6" }] : [])
  ];

  // Render function for each row passed to DataTable
  const renderBranchRow = (branch) => {
    const isInactive = !branch.is_active;

    return (
      <tr 
        key={branch._id} 
        className={`group transition-colors duration-300 border-b border-slate-50 last:border-none hover:bg-slate-50/50 ${
          isInactive ? "opacity-60 grayscale-[20%]" : ""
        }`}
      >
        {/* 1. Branch Details */}
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm tracking-tighter ${branch.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              {branch.branch_code}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                {branch.branch_name}
              </span>
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                <MapPin size={12} className="shrink-0 text-slate-400" /> {branch.address}
              </span>
            </div>
          </div>
        </td>

        {/* 2. Contact Info */}
        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <div className="flex flex-col space-y-1">
            {branch.contact_email && (
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 truncate max-w-[200px]" title={branch.contact_email}>
                <Mail size={11} className="text-slate-400" /> {branch.contact_email}
              </span>
            )}
            {branch.contact_phone && (
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                <Phone size={11} className="text-slate-400" /> {branch.contact_phone}
              </span>
            )}
            {!branch.contact_email && !branch.contact_phone && (
              <span className="text-[12px] text-slate-400 italic">No contact info</span>
            )}
          </div>
        </td>

        {/* 3. Status Badge */}
        <td className="px-6 py-4 text-center align-middle">
          <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
            branch.is_active 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
              : "bg-rose-50 text-rose-600 border border-rose-100"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${branch.is_active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
            {branch.is_active ? "Operational" : "Suspended"}
          </span>
        </td>

        {/* 4. Actions (Admin Only) */}
        {isAdmin && (
          <td className="px-6 py-4 text-right align-middle">
            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
              
              <ActionIconButton 
                icon={branch.is_active ? PowerOff : Power} 
                variant="neutral" 
                onClick={() => handleToggleStatus(branch)} 
                disabled={toggleMutation.isPending}
                title={branch.is_active ? "Suspend Branch" : "Activate Branch"} 
              />
              
              <ActionIconButton 
                icon={Edit3} 
                variant="neutral" 
                onClick={() => navigate(`/admin/update-branch/${branch._id}`)} 
                title="Edit Branch" 
              />
              
              <ActionIconButton 
                icon={Trash2} 
                variant="danger" 
                disabled={deleteMutation.isPending} 
                onClick={() => handleDelete(branch)} 
                title="Delete Branch" 
              />
            </div>
          </td>
        )}
      </tr>
    );
  };

  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to load branches.</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen font-sans bg-[#f4f7fb]">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} />
            Branch Directory
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage physical campuses and network locations.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          {/* Add Branch Button */}
          {isAdmin && (
            <button
              onClick={() => navigate("/admin/add-branch")}
              className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md shadow-slate-200 flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Plus size={18} /> <span className="hidden sm:inline">New Branch</span>
            </button>
          )}
        </div>
      </div>

      {/* Reusable Data Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredBranches}
          renderRow={renderBranchRow}
          isLoading={isLoading}
          emptyStateTitle="No branches found"
          emptyStateSubtitle="There are no branches matching your current search criteria."
        />
      </div>

    </div>
  );
}