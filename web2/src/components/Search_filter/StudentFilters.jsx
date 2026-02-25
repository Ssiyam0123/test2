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

  // ==========================================
  // CRITICAL FIX: Ensure options are STRINGS
  // ==========================================
  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "select",
      color: "blue",
      options:
        filterOptions?.statuses?.map((s) => ({
          value: String(s),
          label: String(s).charAt(0).toUpperCase() + String(s).slice(1),
        })) || [],
    },
    {
      key: "batch",
      label: "Batch",
      type: "select",
      color: "green",
      options:
        filterOptions?.batches?.map((b) => ({
          value: String(b),
          label: String(b),
        })) || [],
    },
    {
      key: "course",
      label: "Course",
      type: "select",
      color: "purple",
      options:
        filterOptions?.courses?.map((c) => ({
          value: String(c._id),
          label: String(c.course_name),
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
      label: "Active Status",
      type: "boolean",
      color: "orange",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      key: "is_verified",
      label: "Verification Status",
      type: "boolean",
      color: "indigo",
      options: [
        { value: "true", label: "Verified" },
        { value: "false", label: "Not Verified" },
      ],
    },
    { key: "date_from", label: "Date From", type: "date", color: "red" },
    { key: "date_to", label: "Date To", type: "date", color: "red" },
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
