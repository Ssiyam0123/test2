// src/components/StudentFilters.jsx
import React, { useState } from 'react';
import DataFilters from '../common/DataFilters.jsx';

const StudentFilters = ({ 
  onSearchSubmit, 
  filterOptions,
  initialFilters = {},
  onFilterChange,
  isLoading = false 
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    status: "all", batch: "all", course: "all", competency: "all",
    is_active: "all", is_verified: "all", date_from: "", date_to: "",
    ...initialFilters
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = { status: "all", batch: "all", course: "all", competency: "all", is_active: "all", is_verified: "all", date_from: "", date_to: "" };
    setFilters(cleared);
    setSearchInput("");
    onFilterChange(cleared);
    onSearchSubmit("");
  };

  // 1. Define the search config
  const searchConfig = {
    value: searchInput,
    onChange: setSearchInput,
    onSubmit: () => onSearchSubmit(searchInput),
    placeholder: "Search students by name, ID, or registration number...",
    showButton: true
  };

  // 2. Define the filter config (Map API data to the right format)
  const filterConfig = [
    { 
      key: "status", label: "Status", type: "select", color: "blue",
      options: filterOptions?.statuses?.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })) 
    },
    { 
      key: "batch", label: "Batch", type: "select", color: "green",
      options: filterOptions?.batches?.map(b => ({ value: b, label: b })) 
    },
    { 
      key: "course", label: "Course", type: "select", color: "purple",
      options: filterOptions?.courses?.map(c => ({ value: c._id, label: c.course_name })) 
    },
    { 
      key: "competency", label: "Competency", type: "select", color: "yellow",
      options: [
        { value: "competent", label: "Competent" },
        { value: "incompetent", label: "Incompetent" },
        { value: "not_assessed", label: "Not Assessed" }
      ]
    },
    { 
      key: "is_active", label: "Active Status", type: "boolean", color: "orange",
      options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] 
    },
    { 
      key: "is_verified", label: "Verification Status", type: "boolean", color: "indigo",
      options: [{ value: "true", label: "Verified" }, { value: "false", label: "Not Verified" }] 
    },
    { key: "date_from", label: "Issue Date From", type: "date", color: "red" },
    { key: "date_to", label: "Issue Date To", type: "date", color: "red" }
  ];

  return (
    <DataFilters
      searchConfig={searchConfig}
      filterConfig={filterConfig}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      isLoading={isLoading}
    />
  );
};

export default StudentFilters;