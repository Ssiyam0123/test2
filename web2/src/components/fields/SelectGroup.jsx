import React from "react";

const SelectGroup = ({ 
  label, name, value, options, onChange, required, error, defaultOption, 
  disabled // 🚀 ACCEPT THE PROP
}) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="block mb-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled} 
          className={`w-full px-4 py-3 border rounded-2xl text-sm font-medium outline-none transition-all duration-200 appearance-none
            ${disabled 
              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-80" // Visual lock
              : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 cursor-pointer hover:bg-gray-100/50"
            }
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}
          `}
        >
          {defaultOption && (
            <option value="" disabled>
              {defaultOption}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Icon */}
        <div className={`absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none ${disabled ? 'opacity-50' : ''}`}>
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 mt-1.5 ml-1 uppercase">{error}</p>}
    </div>
  );
};

export default SelectGroup;