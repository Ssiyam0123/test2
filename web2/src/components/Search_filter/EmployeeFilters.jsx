import React, { useState } from 'react';
import DataFilters from '../common/DataFilters';

const EmployeeFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onFilterChange, 
  initialFilters = {}, 
  isLoading = false 
}) => {
  const [filters, setFilters] = useState({
    status: "all", department: "all", role: "all", date_from: "", date_to: "",
    ...initialFilters
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // FIX: You were missing this line! This tells AllEmployees to update the API query.
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared = { status: "all", department: "all", role: "all", date_from: "", date_to: "" };
    setFilters(cleared);
    onSearchChange(""); // Clears the search bar too
    onFilterChange(cleared);
  };

  // 1. Configure the Search Bar
  const searchConfig = {
    value: searchTerm,
    onChange: onSearchChange,
    placeholder: "Search by name, username, ID, or email...",
    showButton: false // Changed to false since you use live typing (debouncedSearch)
  };

  // 2. Configure the Filters
  const filterConfig = [
    { 
      key: "status", label: "Employment Status", type: "select", color: "green",
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
      key: "role", label: "System Role", type: "select", color: "purple",
      options: [
        { value: "staff", label: "General Staff" },
        { value: "instructor", label: "Instructor" },
        { value: "register", label: "Registrar" },
        { value: "admin", label: "Administrator" }
      ] 
    },
    { key: "date_from", label: "Joining Date From", type: "date", color: "red" },
    { key: "date_to", label: "Joining Date To", type: "date", color: "red" }
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