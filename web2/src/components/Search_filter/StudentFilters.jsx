import React, { useState, useEffect } from "react";
import DataFilters from "../common/DataFilters.jsx";

const StudentFilters = ({
  searchTerm,
  onSearchChange,
  filterOptions,
  initialFilters = {},
  onFilterChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState({
    branch: "all", // NEW
    status: "all",
    batch: "all",
    course: "all",
    competency: "all",
    is_active: "all",
    is_verified: "all",
    date_from: "",
    date_to: "",
    ...initialFilters,
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
      batch: "all",
      course: "all",
      competency: "all",
      is_active: "all",
      is_verified: "all",
      date_from: "",
      date_to: "",
    };
    setFilters(cleared);
    onSearchChange("");
    onFilterChange(cleared);
  };

  const searchConfig = {
    value: searchTerm || "",
    onChange: onSearchChange,
    placeholder: "Search students...",
    showButton: false,
  };

  const filterConfig = [
    // CONDITIONAL BRANCH FILTER (Only shows if parent passes branches)
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
      key: "status",
      label: "Status",
      type: "select",
      color: "blue",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "completed", label: "Completed" },
      ],
    },
    {
      key: "batch",
      label: "Batch",
      type: "select",
      color: "green",
      options:
        filterOptions?.batches?.map((b) => ({
          value: b._id ? String(b._id) : String(b), 
          label: b.batch_name ? String(b.batch_name) : String(b),
        })) || [],
    },
    {
      key: "course",
      label: "Course",
      type: "select",
      color: "purple",
      options:
        filterOptions?.courses?.map((c) => ({
          value: c._id ? String(c._id) : String(c),
          label: c.course_name ? String(c.course_name) : String(c),
        })) || [],
    },
    {
      key: "competency",
      label: "Competency",
      type: "select",
      color: "yellow",
      options: [
        { value: "competent", label: "Competent" },
        { value: "incompetent", label: "Incompetent" },
        { value: "not_assessed", label: "Not Assessed" },
      ],
    },
    {
      key: "is_active",
      label: "System Status",
      type: "boolean",
      color: "orange",
      options: [
        { value: "true", label: "Active Account" },
        { value: "false", label: "Disabled Account" },
      ],
    },
    {
      key: "is_verified",
      label: "Verification Status",
      type: "boolean",
      color: "indigo",
      options: [
        { value: "true", label: "Verified ✓" },
        { value: "false", label: "Pending Verification" },
      ],
    },
    { key: "date_from", label: "Enrolled After", type: "date", color: "red" },
    { key: "date_to", label: "Enrolled Before", type: "date", color: "red" },
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