import React from "react";
import { MapPin, ChevronDown } from "lucide-react";

export default function BranchDropdown({ 
  isMaster, 
  branches = [], 
  value, 
  onChange, 
  showAllOption = true,
  wrapperClassName = "flex justify-end mb-6" 
}) {
  if (!isMaster) return null;

  return (
    <div className={wrapperClassName}>
      <div className="relative w-full md:w-64">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-teal-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
        >
          {showAllOption && <option value="all">🌐 All Campuses</option>}
          
          {branches.map(b => (
            <option key={b._id} value={b._id}>
              {b.branch_name}
            </option>
          ))}
        </select>
        <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none" />
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}