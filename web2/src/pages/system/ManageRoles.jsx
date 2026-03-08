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
import { useConfirmToast } from "../../components/ConfirmToast";

export default function ManageRoles() {
  const { showConfirmToast } = useConfirmToast();

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
      },
    });
  };

  const openPermissionManager = (role) => {
    setSelectedRole(role);
    setActivePermissions(role.permissions || []);
    setIsPermissionModalOpen(true);
    setPermSearch("");
  };

  const handleTogglePermission = (permissionValue) => {
    if (selectedRole?.name === "superadmin") return;
    setActivePermissions((prev) =>
      prev.includes(permissionValue)
        ? prev.filter((p) => p !== permissionValue)
        : [...prev, permissionValue],
    );
  };

  const handleToggleModule = (features, isAllSelected) => {
    if (selectedRole?.name === "superadmin") return;
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
      { onSuccess: () => setIsPermissionModalOpen(false) },
    );
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

  const renderRow = (role) => (
    <tr
      key={role._id}
      className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0"
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-8 rounded-full ${role.is_system_role ? "bg-rose-400" : "bg-indigo-400"}`}
          />
          <span className="text-[14px] font-black text-slate-800 uppercase tracking-tight">
            {role.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-xs text-slate-500 font-medium max-w-xs truncate">
        {role.description || "—"}
      </td>
      <td className="px-6 py-5 text-center">
        <span
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
            role.is_system_role
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-indigo-50 text-indigo-600 border-indigo-100"
          }`}
        >
          {role.is_system_role ? "Protected" : "Custom"}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => openPermissionManager(role)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
          >
            <Settings2 size={14} /> Permissions
          </button>
          {!role.is_system_role && (
            <button
              onClick={() =>
                showConfirmToast({
                  type: "delete",
                  title: "Delete Role",
                  onConfirm: () => deleteMutation.mutate(role._id),
                })
              }
              className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        title="Access Control List"
        subtitle="Manage organizational roles and granular feature permissions."
        onAdd={() => setIsAddModalOpen(true)}
        addText="New Role"
      />

      <DataTable
        columns={columns}
        data={roles}
        renderRow={renderRow}
        isLoading={loadingRoles}
      />

      {/* MODAL: ADD ROLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-white/20">
            <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">
              Create New Role
            </h2>
            <form onSubmit={handleAddRole} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                  Role Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Branch Manager"
                  value={newRoleForm.name}
                  onChange={(e) =>
                    setNewRoleForm({ ...newRoleForm, name: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:bg-white outline-none focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                  Role Objective
                </label>
                <textarea
                  rows="2"
                  placeholder="Briefly describe the scope of this role..."
                  value={newRoleForm.description}
                  onChange={(e) =>
                    setNewRoleForm({
                      ...newRoleForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-sm focus:bg-white outline-none focus:border-teal-500 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-teal-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200"
              >
                {createMutation.isPending ? (
                  <Loader size={20} color="white" />
                ) : (
                  "Confirm & Save Role"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERMISSION MATRIX */}
      {isPermissionModalOpen && selectedRole && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-100">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                    Access Matrix: {selectedRole.name}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
                    Configuring granular system capabilities
                  </p>
                </div>
              </div>
              <div className="relative w-full md:w-72 group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search feature..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-teal-500 shadow-inner"
                />
              </div>
            </div>

            {/* Matrix Content */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 gap-8">
                {PERMISSION_MATRIX.map((module, idx) => {
                  const filteredFeatures = module.features.filter(
                    (f) =>
                      f.label
                        .toLowerCase()
                        .includes(permSearch.toLowerCase()) ||
                      module.page
                        .toLowerCase()
                        .includes(permSearch.toLowerCase()),
                  );
                  if (filteredFeatures.length === 0) return null;

                  const selectedCount = module.features.filter((f) =>
                    activePermissions.includes(f.value),
                  ).length;
                  const isAllSelected =
                    selectedCount === module.features.length;

                  return (
                    <div
                      key={idx}
                      className="group border border-slate-100 rounded-[2rem] overflow-hidden hover:border-teal-200 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between group-hover:bg-teal-50/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-5 bg-teal-500 rounded-full" />
                          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">
                            {module.page}
                          </h3>
                          <span className="text-[9px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-400">
                            {selectedCount} / {module.features.length} ACTIVE
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleToggleModule(module.features, isAllSelected)
                          }
                          disabled={selectedRole.name === "superadmin"}
                          className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg transition-all ${isAllSelected ? "text-rose-500 hover:bg-rose-50" : "text-teal-600 hover:bg-teal-50"}`}
                        >
                          {isAllSelected ? "Deselect All" : "Enable All"}
                        </button>
                      </div>
                      <div className="p-6 bg-white flex flex-wrap gap-3">
                        {filteredFeatures.map((feature) => {
                          const isActive = activePermissions.includes(
                            feature.value,
                          );
                          return (
                            <label
                              key={feature.value}
                              className={`flex items-center gap-3 cursor-pointer border-2 px-4 py-3 rounded-2xl transition-all select-none ${isActive ? "bg-teal-50 border-teal-500 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200 opacity-60 hover:opacity-100"}`}
                            >
                              <input
                                type="checkbox"
                                disabled={selectedRole.name === "superadmin"}
                                className="w-5 h-5 text-teal-600 rounded-lg border-slate-200 focus:ring-teal-500 cursor-pointer"
                                checked={isActive}
                                onChange={() =>
                                  handleTogglePermission(feature.value)
                                }
                              />
                              <span
                                className={`text-xs font-black uppercase tracking-tight ${isActive ? "text-teal-900" : "text-slate-500"}`}
                              >
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
            </div>

            {/* Footer */}
            <div className="px-10 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-400">
                <Info size={16} />
                <span className="text-[10px] font-bold uppercase">
                  Changes will take effect after next user login
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="px-8 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={
                    updateMutation.isPending ||
                    selectedRole.name === "superadmin"
                  }
                  className="px-10 py-4 bg-teal-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-100 flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={18} />
                  )}{" "}
                  Save Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
