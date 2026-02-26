import React, { useState, useEffect } from 'react';
import DataFilters from '../common/DataFilters';

const EmployeeFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filterOptions, // NEW PROP
  onFilterChange, 
  initialFilters = {}, 
  isLoading = false 
}) => {
  const [filters, setFilters] = useState({
    branch: "all", // NEW
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
      branch: "all", // NEW
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
    placeholder: "Search by name, username, ID, or email...",
    showButton: false 
  };

  const filterConfig = [
    // CONDITIONAL BRANCH FILTER
    ...(filterOptions?.branches?.length > 0 ? [{
      key: "branch",
      label: "Campus / Branch",
      type: "select",
      color: "indigo",
      options: filterOptions.branches.map((b) => ({
        value: b._id ? String(b._id) : String(b),
        label: b.branch_name ? String(b.branch_name) : String(b),
      })),
    }] : []),

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
        { value: "registrar", label: "Registrar" },
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