import React, { useState, useEffect } from 'react';
import DataFilters from '../common/DataFilters';

const EmployeeFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterOptions, 
  onFilterChange, 
  initialFilters = {}, 
  isLoading = false 
}) => {
  const [filters, setFilters] = useState({
    branch: "all", 
    status: "all", 
    department: "all", 
    role: "all", 
    date_from: "", 
    date_to: "",
    ...initialFilters
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = { 
      branch: filters.branch, // 🚀 Keep the current branch selected even on clear
      status: "all", 
      department: "all", 
      role: "all", 
      date_from: "", 
      date_to: "" 
    };
    setFilters(cleared);
    onSearchChange(""); 
    onFilterChange(cleared);
  };

  const searchConfig = {
    value: searchTerm,
    onChange: onSearchChange,
    placeholder: "Search by name, ID, or email...",
    showButton: false 
  };

  const filterConfig = [
    // 🚀 Branch Filter removed from here
    { 
      key: "status", label: "Status", type: "select", color: "green",
      options: [
        { value: "Active", label: "Active" },
        { value: "On Leave", label: "On Leave" },
        { value: "Resigned", label: "Resigned" }
      ] 
    },
    { 
      key: "department", label: "Department", type: "select", color: "blue",
      options: [
        { value: "Faculty", label: "Faculty / Instructor" },
        { value: "Administration", label: "Administration" },
        { value: "Management", label: "Management" },
        { value: "Support Staff", label: "Support Staff" }
      ] 
    },
    { 
      key: "role", 
      label: "Role", 
      type: "select", 
      color: "purple",
      options: (filterOptions?.roles || []).map((r) => ({
        value: r._id,
        label: r.name.charAt(0).toUpperCase() + r.name.slice(1)
      }))
    },
    { key: "date_from", label: "From", type: "date", color: "red" },
    { key: "date_to", label: "To", type: "date", color: "red" }
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

export default EmployeeFilters;