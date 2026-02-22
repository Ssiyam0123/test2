// components/courses/CoursesTable.jsx
import React from "react";
import {
  Edit,
  Trash2,
  BookOpen,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Loader from "../Loader";

const CoursesTable = ({
  courses,
  onEdit,
  onDelete,
  onStatusToggle,
  pagination,
  page,
  onPageChange,
  isLoading = false,
  isDeleting = false,
  isToggling = false,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center">
                      <BookOpen size={16} className="mr-2 text-blue-500" />
                      {course.course_name}
                    </div>
                    {course.description && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {course.description}
                      </div>
                    )}
                    {course.additional_info &&
                      course.additional_info.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {course.additional_info.map((info, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              {info}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Hash size={16} className="mr-2 text-gray-400" />
                    <span className="font-mono">{course.course_code}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    {course.duration.value} {course.duration.unit}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onStatusToggle(course._id)}
                    className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full transition-colors ${
                      course.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isToggling}
                    title={
                      course.is_active ? "Deactivate Course" : "Activate Course"
                    }
                  >
                    {course.is_active ? (
                      <>
                        <CheckCircle size={12} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={12} className="mr-1" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onEdit(course._id)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Edit Course"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(course._id, course.course_name)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete Course"
                      disabled={isDeleting}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500">
              Get started by adding your first course
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing {courses.length} of {pagination.total} courses (Page{" "}
              {pagination.page} of {pagination.totalPages})
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1 || isLoading}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum =
                      page <= 3
                        ? i + 1
                        : page >= pagination.totalPages - 2
                          ? pagination.totalPages - 4 + i
                          : page - 2 + i;

                    if (pageNum > 0 && pageNum <= pagination.totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          disabled={isLoading}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                            page === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  },
                )}
              </div>

              <button
                disabled={page === pagination.totalPages || isLoading}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesTable;
