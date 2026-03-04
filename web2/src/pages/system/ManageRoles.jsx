import React, { useState, useEffect } from "react";
import { Save, ShieldCheck, Plus, Settings2, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { PERMISSION_MATRIX } from "../../config/permissionConfig";
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "../../hooks/useRoles"; 
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import { useConfirmToast } from "../../components/ConfirmToast";

export default function ManageRoles() {
  const { showConfirmToast } = useConfirmToast();
  
  // APIs
  const { data: rolesRes, isLoading: loadingRoles } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const roles = rolesRes?.data || [];

  // States for Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  
  // States for Data
  const [selectedRole, setSelectedRole] = useState(null);
  const [activePermissions, setActivePermissions] = useState([]);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "" });

  // ==========================================
  // ROLE CRUD HANDLERS
  // ==========================================
  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return toast.error("Role name is required!");
    
    createMutation.mutate(newRoleForm, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setNewRoleForm({ name: "", description: "" });
      }
    });
  };

  const handleDeleteRole = (role) => {
    if (role.is_system_role) return toast.error("System roles cannot be deleted!");
    
    showConfirmToast({
      type: "delete",
      title: "Delete Role",
      message: `Are you sure you want to delete the '${role.name}' role?`,
      onConfirm: () => deleteMutation.mutate(role._id)
    });
  };

  // ==========================================
  // PERMISSION LOGIC
  // ==========================================
  const openPermissionManager = (role) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
    setIsPermissionModalOpen(true);
  };

  const handleTogglePermission = (permissionValue) => {
    setActivePermissions((prev) => 
      prev.includes(permissionValue) 
        ? prev.filter((p) => p !== permissionValue) 
        : [...prev, permissionValue]
    );
  };

  const handleToggleModule = (features, isAllSelected) => {
    const featureValues = features.map(f => f.value);
    if (isAllSelected) {
      setActivePermissions(prev => prev.filter(p => !featureValues.includes(p)));
    } else {
      setActivePermissions(prev => [...new Set([...prev, ...featureValues])]);
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    
    updateMutation.mutate(
      { id: selectedRole._id, data: { permissions: activePermissions } },
      {
        onSuccess: () => {
          setIsPermissionModalOpen(false);
          setSelectedRole(null);
        }
      }
    );
  };

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const columns = [
    { label: "Role Name", align: "left" },
    { label: "Description", align: "left" },
    { label: "Type", align: "center" },
    { label: "Access Controls", align: "right" },
  ];

  const renderRow = (role) => (
    <tr key={role._id} className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-5">
        <span className="text-[15px] font-bold text-slate-800 uppercase tracking-wide">
          {role.name}
        </span>
      </td>
      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
        {role.description || "No description provided."}
      </td>
      <td className="px-6 py-5 text-center">
        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
          role.is_system_role 
            ? 'bg-rose-50 text-rose-600 border-rose-100' 
            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
        }`}>
          {role.is_system_role ? "System Default" : "Custom Role"}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => openPermissionManager(role)}
            className="px-4 py-2 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white rounded-xl transition-all font-bold text-xs flex items-center gap-2"
          >
            <Settings2 size={14} /> Permissions
          </button>
          
          {!role.is_system_role && (
            <button 
              onClick={() => handleDeleteRole(role)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Delete Role"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-300">
      
      <PageHeader 
        title="Role & Access Management" 
        subtitle="Manage user roles, create custom roles, and configure system permissions." 
      />

      {/* Action Bar */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus size={18} /> Add Custom Role
        </button>
      </div>

      {/* Roles Data Table */}
      <DataTable 
        columns={columns} 
        data={roles} 
        renderRow={renderRow} 
        isLoading={loadingRoles} 
        emptyStateTitle="No Roles Found"
      />

      {/* ==========================================
          MODAL 1: ADD NEW ROLE
      ========================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Create Custom Role</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Role Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Assistant Instructor"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({...newRoleForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="What does this role do?"
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({...newRoleForm, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:bg-white outline-none focus:border-teal-500"
                />
              </div>
              
              <button 
                type="submit" disabled={createMutation.isPending}
                className="w-full mt-4 py-3 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? <Loader size={18} color="white"/> : "Create Role"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: PERMISSION MATRIX MANAGER
      ========================================== */}
      {isPermissionModalOpen && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-teal-600" />
                  Access Matrix: <span className="uppercase text-teal-600">{selectedRole.name}</span>
                </h2>
                {selectedRole.is_system_role && (
                  <p className="text-xs font-bold text-rose-500 mt-1">This is a system role. Some core access cannot be revoked.</p>
                )}
              </div>
              <button onClick={() => setIsPermissionModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"><X size={24}/></button>
            </div>

            {/* Matrix Table (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              <table className="w-full text-left border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest w-1/3">Module Name</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Features & Capabilities</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSION_MATRIX.map((module, idx) => {
                    const isAllSelected = module.features.every(f => activePermissions.includes(f.value));

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800">{module.page}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{module.moduleName}</span>
                            
                            <button 
                              onClick={() => handleToggleModule(module.features, isAllSelected)}
                              disabled={selectedRole.name === "superadmin"}
                              className="text-left text-[10px] font-black text-teal-600 mt-3 hover:underline uppercase disabled:opacity-50"
                            >
                              {isAllSelected ? "Deselect All" : "Select All"}
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-3">
                            {module.features.map((feature) => (
                              <label 
                                key={feature.value} 
                                className={`flex items-center gap-2 cursor-pointer border px-3 py-2 rounded-xl transition-all ${
                                  activePermissions.includes(feature.value) 
                                    ? "bg-teal-50 border-teal-200" 
                                    : "bg-white border-slate-200 hover:border-teal-300"
                                }`}
                              >
                                <input 
                                  type="checkbox" 
                                  disabled={selectedRole.name === "superadmin"}
                                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                                  checked={activePermissions.includes(feature.value)}
                                  onChange={() => handleTogglePermission(feature.value)}
                                />
                                <span className={`text-[11px] font-bold select-none ${
                                  activePermissions.includes(feature.value) ? "text-teal-800" : "text-slate-600"
                                }`}>
                                  {feature.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsPermissionModalOpen(false)} 
                className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePermissions}
                disabled={updateMutation.isPending || selectedRole.name === "superadmin"}
                className="px-8 py-3 bg-teal-600 text-white text-sm font-black rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/30"
              >
                {updateMutation.isPending ? <Loader size={16} color="white"/> : <Save size={18} />}
                Update Permissions
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}