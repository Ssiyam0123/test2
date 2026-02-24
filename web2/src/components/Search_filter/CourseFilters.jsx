import React from 'react';
import DataFilters from '../common/DataFilters';

const CourseFilters = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  onPageReset,
  isLoading = false 
}) => {

  const handleFilterChange = (key, value) => {
    if (key === "status") {
      onStatusFilterChange(value);
      onPageReset();
    }
  };

  const handleSearchChange = (val) => {
    onSearchChange(val);
    onPageReset();
  };

  const clearFilters = () => {
    onStatusFilterChange("all");
    onSearchChange("");
    onPageReset();
  };

  const searchConfig = {
    value: searchTerm,
    onChange: handleSearchChange,
    placeholder: "Search courses by name or code...",
    showButton: true
  };

  const filterConfig = [
    { 
      key: "status", label: "Course Status", type: "select", color: "blue",
      options: [
        { value: "active", label: "Active Only" },
        { value: "inactive", label: "Inactive Only" }
      ] 
    }
  ];

 
  const currentFilters = {
    status: statusFilter
  };

  return (
    <DataFilters
      searchConfig={searchConfig}
      filterConfig={filterConfig}
      filters={currentFilters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      isLoading={isLoading}
    />
  );
};

export default CourseFilters;