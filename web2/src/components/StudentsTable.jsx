import React, { useState } from "react";
import {
  Edit,
  Trash2,
  QrCode,
  User,
  Calendar,
  BookOpen,
  Hash,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  Shield,
  Power,
  PowerOff,
  Eye,
  Loader2,
  MessageSquare, // <-- Imported MessageSquare for comments
} from "lucide-react";
import Loader from "./Loader.jsx";
import { apiURL } from "../../Constant.js";
import { useNavigate } from "react-router-dom";
import { API } from "../api/axios.js";
import toast from "react-hot-toast";

const BASE_URL = apiURL.image_url;

const StudentsTable = ({
  students,
  currentUser, // <-- Receive currentUser here
  pagination,
  onDelete,
  onToggleStatus,
  onGenerateQR,
  onAddComment, // <-- Receive onAddComment here
  onViewDetails,
  onEdit,
  deleteLoading,
  toggleLoading,
  page,
  onPageChange,
  searchTerm,
  onClearFilters,
  filters,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadCertificate = async (student) => {
  try {
    setDownloadingId(student._id);
    
    // Updated route to match your backend mount point
    const response = await API.get(`/generate-certificate/download/${student._id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CIB_Certificate_${student.student_id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Clean up memory
    toast.success("Certificate downloaded successfully");
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Failed to generate certificate");
  } finally {
    setDownloadingId(null);
  }
};

  if (isLoading && (!students || students.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const hasActiveFilters =
    searchTerm ||
    Object.values(filters || {}).some((f) => f !== "all" && f !== "");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative">
      {isLoading && students?.length > 0 && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <Loader />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Student Info
              </th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Academic
              </th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students?.length > 0 ? (
              students.map((student) => {
                const isInactive = !student.is_active;

                return (
                  <tr
                    key={student._id}
                    className={`transition-colors duration-150 ${isInactive ? "bg-gray-50/50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div
                          className={`h-10 w-10 flex-shrink-0 ${isInactive ? "opacity-60 grayscale" : ""}`}
                        >
                          {student.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                              loading="lazy"
                              src={
                                student.photo_url.startsWith("http")
                                  ? student.photo_url
                                  : `${BASE_URL}${student.photo_url}`
                              }
                              alt={student.student_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                              <User size={18} className="text-blue-500" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`ml-3 ${isInactive ? "opacity-70" : ""}`}
                        >
                          <div className="text-sm font-semibold text-gray-900">
                            {student.student_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Father: {student.fathers_name}
                          </div>
                          <div className="flex items-center mt-1 space-x-2 text-xs text-gray-400 font-mono">
                            <span className="flex items-center">
                              <Hash size={10} className="mr-0.5" />
                              {student.student_id}
                            </span>
                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center">
                              <Hash size={10} className="mr-0.5" />
                              {student.registration_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className={`px-5 py-4 ${isInactive ? "opacity-70" : ""}`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center text-sm text-gray-900">
                          <BookOpen
                            size={14}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span
                            className="truncate max-w-[180px]"
                            title={student.course_name}
                          >
                            {student.course_name}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({student.course_code})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar
                            size={14}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span>Batch {student.batch}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock
                            size={14}
                            className="text-gray-400 mr-2 flex-shrink-0"
                          />
                          <span>
                            {student.course_duration?.value || 0}{" "}
                            {student.course_duration?.unit || "months"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className={isInactive ? "opacity-70" : ""}>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              student.status === "active"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : student.status === "completed"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : student.status === "inactive"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : student.status === "discontinued"
                                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                                      : student.status === "on_leave"
                                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                                        : "bg-gray-50 text-gray-700 border border-gray-200"
                            }`}
                          >
                            {student.status
                              ?.replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                              "Unknown"}
                          </span>
                        </div>
                        <div
                          className={`flex items-center ${isInactive ? "opacity-70" : ""}`}
                        >
                          {student.is_verified ? (
                            <div
                              className="flex items-center text-blue-600 font-medium text-xs"
                              title="Verified Student"
                            >
                              <Shield size={12} className="mr-1" /> Verified
                            </div>
                          ) : (
                            <div
                              className="flex items-center text-yellow-600 font-medium text-xs"
                              title="Pending Verification"
                            >
                              <Shield size={12} className="mr-1" /> Unverified
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td
                      className={`px-5 py-4 ${isInactive ? "opacity-70" : ""}`}
                    >
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            Issue Date
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(student.issue_date)}
                          </div>
                        </div>
                        {student.completion_date && (
                          <div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                              Completion
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(student.completion_date)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    <td
                      className={`px-5 py-4 ${isInactive ? "opacity-70" : ""}`}
                    >
                      <div className="space-y-2">
                        {student.contact_number && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Phone
                              size={14}
                              className="text-gray-400 mr-2 flex-shrink-0"
                            />
                            <span>{student.contact_number}</span>
                          </div>
                        )}
                        {student.email && (
                          <div className="flex items-center text-sm text-gray-700">
                            <Mail
                              size={14}
                              className="text-gray-400 mr-2 flex-shrink-0"
                            />
                            <span
                              className="truncate max-w-[160px]"
                              title={student.email}
                            >
                              {student.email}
                            </span>
                          </div>
                        )}
                        {student.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin
                              size={14}
                              className="text-gray-400 mr-2 flex-shrink-0"
                            />
                            <span
                              className="truncate max-w-[160px]"
                              title={student.address}
                            >
                              {student.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* VIEW PROFILE (Everyone can see this) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(student._id);
                          }}
                          className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition"
                          title="View Full Profile"
                        >
                          <Eye size={18} />
                        </button>

                        {/* ADD COMMENT (Only Admins and Instructors) */}
                        {(currentUser?.role === "admin" ||
                          currentUser?.role === "instructor") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddComment(student);
                            }}
                            className="p-2 rounded-md hover:bg-indigo-50 text-indigo-600 transition"
                            title="Add Comment"
                          >
                            <MessageSquare size={18} />
                          </button>
                        )}

                        {/* ADMIN / STAFF ONLY ACTIONS (Hidden from Instructors) */}
                        {currentUser?.role !== "instructor" && (
                          <>
                            {/* Toggle Active / Inactive */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(student._id);
                              }}
                              disabled={toggleLoading}
                              className={`p-2 rounded-md transition disabled:opacity-50 ${
                                student.is_active
                                  ? "hover:bg-amber-50 text-green-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-green-50"
                              }`}
                              title={
                                student.is_active
                                  ? "Deactivate Student"
                                  : "Activate Student"
                              }
                            >
                              {student.is_active ? (
                                <Power size={18} />
                              ) : (
                                <PowerOff size={18} />
                              )}
                            </button>

                            {/* Generate QR */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onGenerateQR(student);
                              }}
                              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
                              title="Generate QR Code"
                            >
                              <QrCode size={18} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(student._id);
                              }}
                              className="p-2 rounded-md hover:bg-emerald-50 text-emerald-600 transition"
                              title="Edit Student"
                            >
                              <Edit size={18} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(student._id, student.student_name);
                              }}
                              disabled={deleteLoading}
                              className="p-2 rounded-md hover:bg-red-50 text-red-600 transition disabled:opacity-50"
                              title="Delete Student"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}

                        {currentUser && (
                          <>
                            {/* NEW: Certificate Download Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadCertificate(student);
                              }}
                              disabled={downloadingId === student._id}
                              className="p-2 rounded-md hover:bg-purple-50 text-purple-600 transition disabled:opacity-50"
                              title="Download Certificate"
                            >
                              {downloadingId === student._id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Award size={18} />
                              )}
                            </button>

                            {/* Toggle Status */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(student._id);
                              }}
                              // ... existing toggle logic
                            >
                              {student.is_active ? (
                                <Power size={18} />
                              ) : (
                                <PowerOff size={18} />
                              )}
                            </button>

                            {/* Rest of your existing buttons (QR, Edit, Delete) */}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <User size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No students found
                    </h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                      {hasActiveFilters
                        ? "We couldn't find any students matching your current search or filter criteria."
                        : "There are currently no students registered in the system."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={onClearFilters}
                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {students?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl z-20 relative">
          <div className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing{" "}
            <span className="font-medium text-gray-900">{students.length}</span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">
              {pagination?.total || 0}
            </span>{" "}
            students
            {searchTerm && (
              <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Search: "{searchTerm}"
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Prev
            </button>
            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, pagination?.totalPages || 1) },
                (_, i) => {
                  const total = pagination?.totalPages || 1;
                  let pageNum =
                    page <= 3
                      ? i + 1
                      : page >= total - 2
                        ? total - 4 + i
                        : page - 2 + i;
                  if (pageNum > 0 && pageNum <= total) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`min-w-[32px] h-8 flex items-center justify-center text-sm font-medium rounded-md transition ${page === pageNum ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
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
              disabled={page === (pagination?.totalPages || 1)}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
