import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import SearchBar from './SearchBar';

const badgeColorClasses = {
  blue: "bg-blue-100 text-blue-800 text-blue-600 hover:text-blue-800",
  green: "bg-green-100 text-green-800 text-green-600 hover:text-green-800",
  purple: "bg-purple-100 text-purple-800 text-purple-600 hover:text-purple-800",
  yellow: "bg-yellow-100 text-yellow-800 text-yellow-600 hover:text-yellow-800",
  orange: "bg-orange-100 text-orange-800 text-orange-600 hover:text-orange-800",
  indigo: "bg-indigo-100 text-indigo-800 text-indigo-600 hover:text-indigo-800",
  red: "bg-red-100 text-red-800 text-red-600 hover:text-red-800",
  default: "bg-gray-100 text-gray-800 text-gray-600 hover:text-gray-800"
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

  // Determine which filters are currently active (not empty and not 'all')
  const activeFilters = filterConfig.filter(f => {
    const val = filters[f.key];
    return val !== undefined && val !== "" && val !== "all";
  });

  // Helper to format values for badges (e.g., matching a Course ID to the Course Name)
  const getDisplayValue = (configItem, val) => {
    if (configItem.type === 'select' && configItem.options) {
      const option = configItem.options.find(o => String(o.value) === String(val));
      return option ? option.label : val;
    }
    if (configItem.type === 'boolean') return val === 'true' ? 'Yes' : 'No';
    return val;
  };

  return (
    <>
      {/* Search Bar Block */}
      {searchConfig && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <SearchBar
            value={searchConfig.value}
            onChange={searchConfig.onChange}
            onSubmit={searchConfig.onSubmit}
            placeholder={searchConfig.placeholder || "Search..."}
            showButton={searchConfig.showButton !== false}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Filter Toggle Button */}
      {filterConfig && filterConfig.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <Filter size={20} />
            <span>Filter</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filterConfig && filterConfig.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={onClearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              <X size={16} />
              <span>Clear all filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterConfig.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                
                {field.type === 'select' || field.type === 'boolean' ? (
                  <select
                    value={filters[field.key]}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Active Filters Badges */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((field) => {
                  const colors = badgeColorClasses[field.color] || badgeColorClasses.default;
                  const [bgClasses, btnClasses] = [
                    colors.split(' text-')[0] + ' text-' + colors.split(' text-')[1], // Gets bg-blue-100 text-blue-800
                    'text-' + colors.split(' text-')[2] + ' ' + colors.split(' ')[3]  // Gets text-blue-600 hover:text-blue-800
                  ];

                  return (
                    <span key={field.key} className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${bgClasses}`}>
                      {field.label}: {getDisplayValue(field, filters[field.key])}
                      <button
                        type="button"
                        onClick={() => onFilterChange(field.key, field.type === 'date' ? "" : "all")}
                        className={`ml-2 ${btnClasses}`}
                        disabled={isLoading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DataFilters;