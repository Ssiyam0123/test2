import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit3, Trash2, Power, PowerOff, MapPin, Mail, Phone, Building2 } from "lucide-react";
import { useBranches, useToggleBranchStatus, useDeleteBranch } from "../../hooks/useBranches.js";
import useAuth from "../../store/useAuth.js";
import { confirmDelete } from "../../utils/swalUtils"; // 🚀 Reusable Swal Import
import DataTable from "../../components/common/DataTable.jsx";
import ActionIconButton from "../../components/common/ActionIconButton.jsx";
import PermissionGuard from "../../components/common/PermissionGuard.jsx";
import { PERMISSIONS } from "../../config/permissionConfig.js";

export default function AllBranches() {
  const navigate = useNavigate();
  const { isMaster, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: branches = [], isLoading } = useBranches();
  const toggleMutation = useToggleBranchStatus();
  const deleteMutation = useDeleteBranch();

  // 🚀 গ্র্যানুলার পারমিশন ফ্ল্যাগস
  const canEdit = hasPermission(PERMISSIONS.BRANCH_EDIT);
  const canToggle = hasPermission(PERMISSIONS.BRANCH_ACTIVE_STATUS);
  const canDelete = hasPermission(PERMISSIONS.BRANCH_DELETE);
  const hasActionAccess = canEdit || canToggle || canDelete;

  const filteredBranches = branches.filter((b) => 
    b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.branch_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id, name) => {
    confirmDelete({
      title: "Delete Branch?",
      text: `Are you sure you want to permanently remove "${name}"? This action cannot be undone.`,
      confirmText: "Yes, delete branch",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    { label: "Branch Details", className: "w-[40%] pl-6" },
    { label: "Contact Info", className: "hidden md:table-cell w-[30%]" },
    { label: "Status", className: "text-center w-[15%]" },
    ...(hasActionAccess ? [{ label: "Actions", align: "right", className: "w-[15%] pr-6" }] : [])
  ];

  const renderBranchRow = (branch) => (
    <tr key={branch._id} className={`group transition-colors border-b border-slate-50 last:border-none hover:bg-slate-50/50 ${!branch.is_active ? "opacity-60" : ""}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm ${branch.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
            {branch.branch_code}
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-slate-800">{branch.branch_name}</span>
            <span className="text-[12px] text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> {branch.address}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <div className="flex flex-col space-y-1 text-[12px] text-slate-500 font-medium">
          {branch.contact_email && <span className="flex items-center gap-1.5"><Mail size={11} /> {branch.contact_email}</span>}
          {branch.contact_phone && <span className="flex items-center gap-1.5"><Phone size={11} /> {branch.contact_phone}</span>}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase ${branch.is_active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {branch.is_active ? "Operational" : "Suspended"}
        </span>
      </td>
      
      {hasActionAccess && (
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            {/* ⚡ অ্যাক্টিভ স্ট্যাটাস কন্ট্রোল */}
            {canToggle && (
              <ActionIconButton 
                icon={branch.is_active ? PowerOff : Power} 
                onClick={() => toggleMutation.mutate(branch._id)} 
                disabled={toggleMutation.isPending}
                title="Toggle Status"
              />
            )}
            {/* 📝 এডিট ব্রাঞ্চ */}
            {canEdit && (
              <ActionIconButton 
                icon={Edit3} 
                onClick={() => navigate(`/admin/update-branch/${branch._id}`)} 
                title="Edit Branch" 
              />
            )}
            {/* 🗑️ ডিলিট ব্রাঞ্চ */}
            {canDelete && (
              <ActionIconButton 
                icon={Trash2} 
                variant="danger" 
                onClick={() => handleDeleteClick(branch._id, branch.branch_name)} 
                disabled={deleteMutation.isPending}
                title="Delete Branch" 
              />
            )}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-600" size={32} /> Branch Directory
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Search branches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          {/* 🚀 নতুন ব্রাঞ্চ তৈরি করা এডিট পারমিশনের আন্ডারে */}
          {canEdit && (
            <button onClick={() => navigate("/admin/add-branch")} className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all flex items-center gap-2">
              <Plus size={18} /> New Branch
            </button>
          )}
        </div>
      </div>
      <DataTable columns={columns} data={filteredBranches} renderRow={renderBranchRow} isLoading={isLoading} emptyStateTitle="No branches found" />
    </div>
  );
}