import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses, useDeleteCourse, useToggleCourseStatus } from "../../hooks/useCourses";
import useAuth from "../../store/useAuth"; // 🚀 Import useAuth for PBAC
import { PERMISSIONS } from "../../utils/permissions"; // 🚀 Import Permissions Dictionary
import { confirmDelete } from "../../utils/swalUtils"; // 🚀 Import Swal Utility

// Components
import CourseFilters from "../../components/Search_filter/CourseFilters";
import PageHeader from "../../components/common/PageHeader";
import DataErrorState from "../../components/common/DataErrorState";
import DataTable from "../../components/common/DataTable";
import ActionIconButton from "../../components/common/ActionIconButton";

// Icons
import { Edit, Trash2, BookOpen, Hash, Clock, Power, PowerOff } from "lucide-react";

const AllCourses = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth(); // 🚀 Extract auth user
  
  // 🚀 PBAC DYNAMIC SECURITY CHECKS
  const isMaster = authUser?.permissions?.includes("all_access") || authUser?.role === "superadmin" || authUser?.role?.name === "superadmin";
  const canManageCourses = isMaster || authUser?.permissions?.includes(PERMISSIONS.MANAGE_COURSES);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 30;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  const filters = useMemo(() => ({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "all" && { is_active: statusFilter === "active" })
  }), [debouncedSearch, statusFilter]);
  
  const { data, isLoading, error, refetch, isRefetching } = useCourses(page, limit, filters);
  const deleteCourseMutation = useDeleteCourse();
  const toggleStatusMutation = useToggleCourseStatus();
  
  const courses = data?.data || [];
  const pagination = data?.pagination;

  useEffect(() => { setPage(1); }, [filters]);

  // 🚀 DYNAMIC DELETE HANDLER WITH SWAL
  const handleDeleteClick = (id, courseName) => {
    confirmDelete({
      title: "Delete Course?",
      text: `Are you sure you want to permanently delete "${courseName}"? This cannot be undone.`,
      confirmText: "Yes, delete course",
      onConfirm: () => deleteCourseMutation.mutate(id)
    });
  };

  const handleStatusToggle = (id) => toggleStatusMutation.mutate(id);

  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  // 🚀 Dynamically hide the "Actions" column header if the user doesn't have permission
  const columns = [
    { label: "Course Details" },
    { label: "Code" },
    { label: "Duration" },
    { label: "Status" },
    ...(canManageCourses ? [{ label: "Actions", align: "right" }] : []) 
  ];

  const renderCourseRow = (course) => (
    <tr key={course._id} className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <div className="font-medium text-gray-900 flex items-center">
          <BookOpen size={16} className="mr-2 text-blue-500" /> {course.course_name}
        </div>
        {course.additional_info?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 ml-6">
            {course.additional_info.map((info, idx) => (
              <span key={idx} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-md font-medium uppercase tracking-wider">
                {info}
              </span>
            ))}
          </div>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center text-sm text-gray-900">
          <Hash size={16} className="mr-1 text-gray-400" /> 
          <span className="font-mono">{course.course_code}</span>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center text-sm text-gray-900">
          <Clock size={16} className="mr-1.5 text-gray-400" /> 
          {course.duration?.value} {course.duration?.unit}
        </div>
      </td>

      <td className="px-5 py-4">
        <span className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full ${course.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {course.is_active ? "Active" : "Inactive"}
        </span>
      </td>

      {/* 🚀 Protect the action buttons rendering */}
      {canManageCourses && (
        <td className="px-5 py-4 text-right">
          <div className="flex items-center justify-end space-x-1.5">
            <ActionIconButton 
              icon={course.is_active ? Power : PowerOff} 
              variant={course.is_active ? "activeToggle" : "inactiveToggle"} 
              onClick={() => handleStatusToggle(course._id)} 
              disabled={toggleStatusMutation.isPending} 
              title={course.is_active ? "Deactivate Course" : "Activate Course"} 
            />
            <ActionIconButton 
              icon={Edit} 
              variant="primary" 
              onClick={() => navigate(`/admin/update-course/${course._id}`)} 
              title="Edit" 
            />
            <ActionIconButton 
              icon={Trash2} 
              variant="danger" 
              disabled={deleteCourseMutation.isPending} 
              onClick={() => handleDeleteClick(course._id, course.course_name)} 
              title="Delete" 
            />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen relative">
      <PageHeader 
        title="Course Management"
        subtitle={`Total active courses: ${pagination?.total || 0}`}
        // 🚀 Remove the Add Course button if they lack permissions
        onAdd={canManageCourses ? () => navigate("/admin/add-course") : null}
        addText="Add Course"
      />

      <div className="mb-6">
        <CourseFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onPageReset={() => setPage(1)}
          isLoading={isLoading}
        />
      </div>

      <DataTable
        columns={columns}
        data={courses}
        renderRow={renderCourseRow}
        isLoading={isLoading}
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        emptyStateIcon={BookOpen}
        emptyStateTitle="No courses found"
      />
    </div>
  );
};

export default AllCourses;