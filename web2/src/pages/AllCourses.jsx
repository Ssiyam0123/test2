// pages/AllCourses.jsx - Updated
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses, useDeleteCourse, useToggleCourseStatus } from "../hooks/useCourses";
import CourseHeader from "../components/courses/CourseHeader";
import CourseFilters from "../components/courses/CourseFilters";
import CoursesTable from "../components/courses/CoursesTable";
import { useConfirmToast } from "../components/ConfirmToast";
import toast from "react-hot-toast";

const AllCourses = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 30;
  
  const navigate = useNavigate();
  const { showConfirmToast } = useConfirmToast();
  
  // Build filters
  const filters = {};
  if (searchTerm) filters.search = searchTerm;
  if (statusFilter !== "all") filters.is_active = statusFilter === "active";
  
  const { data, isLoading, error, refetch } = useCourses(page, limit, filters);
  const deleteCourseMutation = useDeleteCourse();
  const toggleStatusMutation = useToggleCourseStatus();
  
  const courses = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = (id, courseName) => {
    showConfirmToast({
      type: 'delete',
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      itemName: courseName,
      confirmText: 'Delete',
      confirmColor: 'red',
      onConfirm: () => {
        const loadingToast = toast.loading('Deleting course...');
        deleteCourseMutation.mutate(id, {
          onSuccess: () => {
            toast.dismiss(loadingToast);
          },
          onError: () => {
            toast.dismiss(loadingToast);
          }
        });
      },
      onCancel: () => {
        // Optional: Handle cancel action
      }
    });
  };

  const handleStatusToggle = (id, courseName, isActive) => {
    showConfirmToast({
      type: isActive ? 'deactivate' : 'verify',
      title: isActive ? 'Deactivate Course' : 'Activate Course',
      message: isActive 
        ? 'Are you sure you want to deactivate this course?'
        : 'Are you sure you want to activate this course?',
      itemName: courseName,
      confirmText: isActive ? 'Deactivate' : 'Activate',
      confirmColor: isActive ? 'yellow' : 'green',
      onConfirm: () => {
        toggleStatusMutation.mutate(id);
      }
    });
  };

  const handleEdit = (courseId) => {
    navigate(`/admin/update-course/${courseId}`);
  };

  const handleAddCourse = () => {
    navigate("/admin/add-course");
  };

  const handlePageReset = () => {
    setPage(1);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading courses: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <CourseHeader 
        totalCourses={pagination?.total}
        onAddCourse={handleAddCourse}
        isLoading={isLoading}
      />

      {/* Filters */}
      <CourseFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onPageReset={handlePageReset}
        isLoading={isLoading}
      />

      {/* Courses Table */}
      <CoursesTable 
        courses={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusToggle={(id, courseName, isActive) => handleStatusToggle(id, courseName, isActive)}
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        isDeleting={deleteCourseMutation.isLoading}
        isToggling={toggleStatusMutation.isLoading}
      />
    </div>
  );
};

export default AllCourses;