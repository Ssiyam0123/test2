import React from "react";

const SelectGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  defaultOption,
}) => {
  const isError = !!error;
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="block mb-1.5 text-sm font-medium text-gray-800"
      >
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={isError ? "true" : "false"}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
          isError
            ? "border-red-500 focus:ring-red-200 bg-red-50"
            : "border-gray-300 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400"
        }`}
      >
        {defaultOption && <option value="">{defaultOption}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isError && (
        <div className="flex items-center mt-1.5 text-sm text-red-600 font-medium">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SelectGroup;
