import React, { useState, useEffect } from "react";
import { X, Shield, CheckSquare, Square } from "lucide-react";
import { useCreateRole, useUpdateRole } from "../../hooks/useRoles";
import { PERMISSION_MODULES } from "../../utils/permissions";
import Loader from "../Loader";

const RoleModal = ({ isOpen, onClose, roleData = null }) => {
  const isEditing = !!roleData;
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: []
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (roleData) {
      setFormData({
        name: roleData.name || "",
        description: roleData.description || "",
        permissions: roleData.permissions || []
      });
    } else {
      setFormData({ name: "", description: "", permissions: [] });
    }
  }, [roleData, isOpen]);

  if (!isOpen) return null;

  const handleTogglePermission = (permId) => {
    setFormData(prev => {
      const isSelected = prev.permissions.includes(permId);
      if (isSelected) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: roleData._id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {isEditing ? "Edit Role Access" : "Create Custom Role"}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Define what this role can do
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Role Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={isEditing && roleData?.is_system_role} // Protect system roles
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 disabled:opacity-50"
                  placeholder="e.g. Junior Accountant"
                />
                {isEditing && roleData?.is_system_role && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1">System roles cannot be renamed.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                  placeholder="What does this role do?"
                />
              </div>
            </div>

            <div className="h-px w-full bg-slate-100 my-4"></div>

            {/* Checkboxes Area */}
            <div>
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <CheckSquare size={16} className="text-indigo-500"/> Assign Permissions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERMISSION_MODULES.map((mod, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-200">
                      {mod.module}
                    </h4>
                    <div className="space-y-2.5">
                      {mod.permissions.map(p => {
                        const isChecked = formData.permissions.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => handleTogglePermission(p.id)} className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${isChecked ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 text-transparent group-hover:border-indigo-400'}`}>
                              {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                            </div>
                            <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-indigo-900' : 'text-slate-600'}`}>
                              {p.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isMutating || !formData.name}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isMutating ? <Loader size={16} color="white" /> : "Save Role Policy"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleModal;