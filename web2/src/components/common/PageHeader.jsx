import React from 'react';
import { Plus } from 'lucide-react';
import PermissionGuard from './PermissionGuard';

const PageHeader = ({ title, subtitle, onAdd, addText, addPermission = "all_access" }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
      </div>

      {onAdd && addText && (
        // 🚀 Button will automatically hide if user lacks permission
        <PermissionGuard requiredPermission={addPermission}>
          <button 
            onClick={onAdd} 
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} />
            {addText}
          </button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default PageHeader;