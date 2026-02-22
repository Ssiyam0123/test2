// components/StudentFilters.jsx
import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const StudentFilters = ({ 
  onFilterChange, 
  onSearchSubmit, 
  filterOptions,
  initialFilters = {},
  isLoading = false 
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    batch: "all",
    course: "all",
    competency: "all",
    is_active: "all",
    is_verified: "all",
    date_from: "",
    date_to: "",
    ...initialFilters
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchInput);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: "all",
      batch: "all",
      course: "all",
      competency: "all",
      is_active: "all",
      is_verified: "all",
      date_from: "",
      date_to: "",
    };
    setFilters(clearedFilters);
    setSearchInput("");
    onFilterChange(clearedFilters);
    onSearchSubmit("");
  };

  return (
    <>
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search students by name, ID, or registration number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Filter Toggle Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          <Filter size={20} />
          <span>Filter</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              <X size={16} />
              <span>Clear all filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Statuses</option>
                {filterOptions?.statuses?.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch
              </label>
              <select
                value={filters.batch}
                onChange={(e) => handleFilterChange("batch", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Batches</option>
                {filterOptions?.batches?.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => handleFilterChange("course", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Courses</option>
                {filterOptions?.courses?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Competency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competency
              </label>
              <select
                value={filters.competency}
                onChange={(e) => handleFilterChange("competency", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All Competencies</option>
                <option value="competent">Competent</option>
                <option value="incompetent">Incompetent</option>
                <option value="not_assessed">Not Assessed</option>
              </select>
            </div>

            {/* Active Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Status
              </label>
              <select
                value={filters.is_active}
                onChange={(e) => handleFilterChange("is_active", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Verification Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                value={filters.is_verified}
                onChange={(e) => handleFilterChange("is_verified", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="all">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Active Filters Badges */}
          {(filters.status !== "all" ||
            filters.batch !== "all" ||
            filters.course !== "all" ||
            filters.competency !== "all" ||
            filters.is_active !== "all" ||
            filters.is_verified !== "all" ||
            filters.date_from ||
            filters.date_to) && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {filters.status !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Status: {filters.status}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("status", "all")}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.batch !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Batch: {filters.batch}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("batch", "all")}
                      className="ml-2 text-green-600 hover:text-green-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.course !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                    Course:{" "}
                    {
                      filterOptions?.courses?.find(
                        (c) => c._id === filters.course,
                      )?.course_name
                    }
                    <button
                      type="button"
                      onClick={() => handleFilterChange("course", "all")}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.competency !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    Competency: {filters.competency}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("competency", "all")}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.is_active !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    Active: {filters.is_active === "true" ? "Yes" : "No"}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("is_active", "all")}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.is_verified !== "all" && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    Verified: {filters.is_verified === "true" ? "Yes" : "No"}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("is_verified", "all")}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.date_from && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    From: {filters.date_from}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("date_from", "")}
                      className="ml-2 text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.date_to && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    To: {filters.date_to}
                    <button
                      type="button"
                      onClick={() => handleFilterChange("date_to", "")}
                      className="ml-2 text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default StudentFilters;