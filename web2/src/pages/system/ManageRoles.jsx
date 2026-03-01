import React, { useState } from "react";
import { Shield, Plus, Edit2, Trash2, ShieldAlert, Key } from "lucide-react";
import { useRoles, useDeleteRole } from "../../hooks/useRoles";
import PageHeader from "../../components/common/PageHeader";
import RoleModal from "../../components/modal/RoleModal";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const ManageRoles = () => {
  const { data: rolesRes, isLoading } = useRoles();
  const deleteMutation = useDeleteRole();
  const roles = rolesRes?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
    if (role.is_system_role) {
      return toast.error("System roles cannot be deleted.");
    }
    if (window.confirm(`Are you sure you want to delete the role: ${role.name}?`)) {
      await deleteMutation.mutateAsync(role._id);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader /></div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen animate-in fade-in duration-300">
      <PageHeader 
        title="Role & Access Management" 
        subtitle="Create custom roles and define specific permissions for your staff." 
        onAdd={handleCreate} 
        addText="Create Custom Role" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {roles.map(role => (
          <div key={role._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            
            {/* CARD HEADER */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {role.is_system_role ? <ShieldAlert size={16} className="text-amber-500" /> : <Key size={16} className="text-indigo-500" />}
                  <h3 className="text-lg font-black text-slate-800 capitalize">{role.name}</h3>
                </div>
                <p className="text-xs font-bold text-slate-400">{role.description || "No description provided."}</p>
              </div>
              {role.is_system_role && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-md">
                  System Role
                </span>
              )}
            </div>

            {/* PERMISSIONS LIST */}
            <div className="p-5 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Permissions ({role.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions?.includes("all_access") ? (
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold rounded-lg shadow-sm">
                    ✨ Master Key (All Access)
                  </span>
                ) : role.permissions?.length > 0 ? (
                  role.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md capitalize">
                      {perm.replace(/_/g, " ")}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-slate-400 italic">No permissions assigned.</span>
                )}
              </div>
            </div>

            {/* CARD FOOTER ACTIONS */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => handleEdit(role)} 
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
              >
                <Edit2 size={14} /> Edit Access
              </button>
              
              {!role.is_system_role && (
                <button 
                  onClick={() => handleDelete(role)}
                  className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      <RoleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        roleData={editingRole} 
      />
    </div>
  );
};

export default ManageRoles;