import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import SearchBar from './SearchBar';

const badgeColorClasses = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  yellow: "bg-amber-50 text-amber-700 border-amber-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  red: "bg-rose-50 text-rose-700 border-rose-100",
  default: "bg-slate-50 text-slate-700 border-slate-200"
};

const DataFilters = ({
  searchConfig,   // { value, onChange, onSubmit, placeholder, showButton }
  filterConfig,   // Array defining the dropdowns/inputs
  filters,        // Current filter state object
  onFilterChange, // function(key, value)
  onClearFilters, // function()
  isLoading = false
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Determine which filters are currently active
  const activeFilters = filterConfig.filter(f => {
    const val = filters[f.key];
    return val !== undefined && val !== "" && val !== "all";
  });

  const getDisplayValue = (configItem, val) => {
    if (configItem.type === 'select' && configItem.options) {
      const option = configItem.options.find(o => String(o.value) === String(val));
      return option ? option.label : val;
    }
    if (configItem.type === 'boolean') return val === 'true' ? 'Yes' : 'No';
    return val;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar Block */}
      {searchConfig && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchConfig.value}
            onChange={(e) => searchConfig.onChange(e.target.value)}
            placeholder={searchConfig.placeholder || "Search..."}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 shadow-sm transition-all text-sm font-medium placeholder:text-slate-400"
            disabled={isLoading}
          />
          {isLoading && (
             <div className="absolute right-4 inset-y-0 flex items-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          )}
        </div>
      )}

      {/* Filter Toggle and Active Badges Summary */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
            showFilters 
            ? 'bg-[#1e293b] text-white border-[#1e293b]' 
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
          disabled={isLoading}
        >
          <Filter size={18} />
          <span>Filters</span>
          {activeFilters.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded-full">
              {activeFilters.length}
            </span>
          )}
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Inline Active Badges (When panel is closed) */}
        {!showFilters && activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2">
            {activeFilters.map((field) => (
              <span key={field.key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-tight ${badgeColorClasses[field.color] || badgeColorClasses.default}`}>
                {field.label}: {getDisplayValue(field, filters[field.key])}
                <X 
                  size={14} 
                  className="cursor-pointer hover:opacity-70" 
                  onClick={() => onFilterChange(field.key, field.type === 'date' ? "" : "all")}
                />
              </span>
            ))}
            <button onClick={onClearFilters} className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest px-2">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-6 animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Refine Results</h3>
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
              disabled={isLoading}
            >
              <X size={14} />
              <span>Clear Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterConfig.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {field.label}
                </label>
                
                {field.type === 'select' || field.type === 'boolean' ? (
                  <select
                    value={filters[field.key]}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-200 transition-all appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    <option value="all">{field.defaultOption || `All ${field.label}`}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type || "text"}
                    value={filters[field.key] || ""}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-200 transition-all"
                    disabled={isLoading}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFilters;