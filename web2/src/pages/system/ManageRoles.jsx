import React, { useState, useMemo } from "react";
import {
  Save,
  ShieldCheck,
  Plus,
  Settings2,
  Trash2,
  X,
  Search,
  Info,
  Loader2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { PERMISSION_MATRIX } from "../../config/permissionConfig";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "../../hooks/useRoles";
import Loader from "../../components/Loader";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import { confirmDelete } from "../../utils/swalUtils"; // 🚀 Reusable Swal Import

export default function ManageRoles() {
  // APIs
  const { data: rolesRes, isLoading: loadingRoles } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const roles = rolesRes || [];

  // States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activePermissions, setActivePermissions] = useState([]);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "" });
  const [permSearch, setPermSearch] = useState("");

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return toast.error("Role name is required!");
    createMutation.mutate(newRoleForm, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setNewRoleForm({ name: "", description: "" });
        toast.success("New role created successfully");
      },
    });
  };

  const openPermissionManager = (role) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
    setIsPermissionModalOpen(true);
    setPermSearch("");
  };

  const isRoleProtected = (role) => {
    return role?.name?.toLowerCase() === "superadmin" || role?.is_system_role;
  };

  const handleTogglePermission = (permissionValue) => {
    if (selectedRole?.name?.toLowerCase() === "superadmin") return;
    setActivePermissions((prev) =>
      prev.includes(permissionValue)
        ? prev.filter((p) => p !== permissionValue)
        : [...prev, permissionValue],
    );
  };

  const handleToggleModule = (features, isAllSelected) => {
    if (selectedRole?.name?.toLowerCase() === "superadmin") return;
    const featureValues = features.map((f) => f.value);
    if (isAllSelected) {
      setActivePermissions((prev) =>
        prev.filter((p) => !featureValues.includes(p)),
      );
    } else {
      setActivePermissions((prev) => [...new Set([...prev, ...featureValues])]);
    }
  };

  const handleSavePermissions = () => {
    updateMutation.mutate(
      {
        id: selectedRole._id,
        roleData: { permissions: activePermissions },
      },
      { 
        onSuccess: () => {
          // setIsPermissionModalOpen(false);
          toast.success(`Access Matrix updated for ${selectedRole.name}`);
        } 
      },
    );
  };

  const handleDeleteClick = (role) => {
    confirmDelete({
      title: "Delete Role?",
      text: `Are you sure you want to delete "${role.name}"? This will affect all users assigned to this role.`,
      confirmText: "Yes, delete role",
      onConfirm: () => deleteMutation.mutate(role._id)
    });
  };

  // ==========================================
  // TABLE CONFIG
  // ==========================================
  const columns = [
    { label: "Role Identity", align: "left" },
    { label: "Description", align: "left" },
    { label: "Type", align: "center" },
    { label: "Controls", align: "right" },
  ];

  const renderRow = (role) => {
    const isSuper = role.name?.toLowerCase() === "superadmin";
    
    return (
      <tr key={role._id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
        <td className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-8 rounded-full ${isSuper ? "bg-amber-400" : role.is_system_role ? "bg-rose-400" : "bg-indigo-400"}`} />
            <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">
              {role.name}
            </span>
          </div>
        </td>
        <td className="px-6 py-5 text-xs text-slate-500 font-medium max-w-xs truncate">
          {role.description || "Administrative Access Control"}
        </td>
        <td className="px-6 py-5 text-center">
          <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            isSuper ? "bg-amber-50 text-amber-600 border-amber-100" :
            role.is_system_role ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
          }`}>
            {isSuper ? "Master" : role.is_system_role ? "System" : "Custom"}
          </span>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openPermissionManager(role)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
            >
              {isSuper ? <Lock size={14} /> : <Settings2 size={14} />} 
              {isSuper ? "View Matrix" : "Set Access"}
            </button>
            {!role.is_system_role && !isSuper && (
              <button
                onClick={() => handleDeleteClick(role)}
                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Delete Role"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        title="Role Management"
        subtitle="Manage and oversee granular access permissions for all staff types."
        onAdd={() => setIsAddModalOpen(true)}
        addText="Create New Role"
      />

      <DataTable
        columns={columns}
        data={roles}
        renderRow={renderRow}
        isLoading={loadingRoles}
        emptyStateTitle="No Roles Defined"
      />

      {/* MODAL: ADD ROLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-slate-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tighter">New Identity</h2>
            <form onSubmit={handleAddRole} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Role Title</label>
                <input
                  type="text" required placeholder="e.g. Finance Head"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Job Description</label>
                <textarea
                  rows="2" placeholder="Briefly describe what this role does..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none shadow-inner"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-800">Cancel</button>
                <button
                  type="submit" disabled={createMutation.isPending}
                  className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100"
                >
                  {createMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Create Identity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERMISSION MATRIX */}
      {isPermissionModalOpen && selectedRole && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="bg-[#f8fafc] rounded-[3rem] w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Access Matrix: {selectedRole.name}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure granular system capabilities</p>
                </div>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text" placeholder="Search a capability..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Matrix Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
              {PERMISSION_MATRIX.map((module, idx) => {
                const filteredFeatures = module.features.filter(
                  (f) =>
                    f.label.toLowerCase().includes(permSearch.toLowerCase()) ||
                    module.moduleName.toLowerCase().includes(permSearch.toLowerCase())
                );
                if (filteredFeatures.length === 0) return null;

                const selectedCount = module.features.filter((f) => activePermissions.includes(f.value)).length;
                const isAllSelected = selectedCount === module.features.length;
                const isSuperAdmin = selectedRole.name?.toLowerCase() === "superadmin";

                return (
                  <div key={idx} className="group bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:border-indigo-200 transition-all shadow-sm hover:shadow-xl">
                    <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        <div>
                           <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">{module.moduleName}</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{module.page}</p>
                        </div>
                        <span className="text-[9px] font-black bg-white border border-slate-200 px-3 py-1 rounded-full text-indigo-500">
                          {selectedCount} / {module.features.length} ACTIVE
                        </span>
                      </div>
                      {!isSuperAdmin && (
                        <button
                          onClick={() => handleToggleModule(module.features, isAllSelected)}
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${isAllSelected ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-teal-50 text-teal-600 border border-teal-100"}`}
                        >
                          {isAllSelected ? "Deactivate All" : "Authorize Module"}
                        </button>
                      )}
                    </div>
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredFeatures.map((feature) => {
                        const isActive = activePermissions.includes(feature.value);
                        return (
                          <label
                            key={feature.value}
                            className={`flex items-center gap-3 cursor-pointer border-2 px-5 py-4 rounded-[1.5rem] transition-all select-none ${isActive ? "bg-white border-indigo-500 shadow-lg shadow-indigo-50" : "bg-slate-50 border-slate-50 hover:border-slate-200 opacity-60 hover:opacity-100"}`}
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox" disabled={isSuperAdmin}
                                className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                                checked={isActive}
                                onChange={() => handleTogglePermission(feature.value)}
                              />
                            </div>
                            <span className={`text-[11px] font-black uppercase tracking-tight ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                              {feature.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-10 py-8 border-t border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                <Info size={18} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Authorization changes will take effect upon next authentication sync.
                </span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={updateMutation.isPending || selectedRole?.name?.toLowerCase() === "superadmin"}
                  className="px-10 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 shadow-2xl shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Deploy Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}