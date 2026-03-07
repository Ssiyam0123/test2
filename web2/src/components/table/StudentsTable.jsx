import React from "react";
import {
  Edit, Trash2, QrCode, Power, PowerOff, Eye, Loader2, MessageSquare, 
  ShieldCheck, Award, MapPin, Wallet, BookOpen
} from "lucide-react";
import { useDownloadCertificate } from "../../hooks/useStudents.js";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../../store/useAuth.js";

// 🚀 IMPORT THE REUSABLE SWAL DELETE UTILITY
import { confirmDelete } from "../../utils/swalUtils"; 

const StudentsTable = ({
  students, pagination, onDelete, onToggleStatus, 
  onGenerateQR, onAddComment, onEdit, onPay, 
  deleteLoading, toggleLoading, page, onPageChange, searchTerm, isLoading = false,
}) => {
  const downloadMutation = useDownloadCertificate();
  const navigate = useNavigate();
  
  const { hasPermission } = useAuth();

  const handleDownloadCertificate = (student) => {
    downloadMutation.mutate(student);
  };

  // 🚀 DYNAMIC DELETE HANDLER
  const handleDeleteClick = (studentId, studentName) => {
    confirmDelete({
      title: "Delete Student?",
      text: `Are you sure you want to permanently delete ${studentName}? This action cannot be undone.`,
      confirmText: "Yes, delete student",
      onConfirm: () => onDelete(studentId) 
    });
  };

  // ==========================================
  // 🛡️ DYNAMIC PBAC FLAGS
  // ==========================================
  const canCollectFee = hasPermission("collect_fees");
  const canAddComment = hasPermission("add_student_comment");
  const canEdit = hasPermission("edit_student");
  const canDelete = hasPermission("delete_student");
  const canViewDetails = hasPermission("view_student_details") || hasPermission("view_students");

  // ==========================================
  // 📊 DYNAMIC COLUMNS (Removed Balance Column)
  // ==========================================
  const columns = [
    { label: "Student Name", className: "w-[25%]" },
    { label: "Branch", className: "hidden sm:table-cell w-[15%]" },
    { label: "ID", className: "hidden md:table-cell w-[15%]" },
    { label: "Course", className: "hidden lg:table-cell w-[20%]" },
    { label: "Status", className: "w-[10%]" },
    { label: "Actions", align: "right", className: "w-[15%]" },
  ].filter(Boolean);

  const renderStudentRow = (student) => {
    const isInactive = !student.is_active;
    const isDownloadingThis = downloadMutation.isPending && downloadMutation.variables?._id === student._id;

    return (
      <tr
        key={student._id}
        className={`group transition-colors duration-300 hover:bg-slate-50/50 ${isInactive ? "opacity-60 grayscale-[20%]" : ""}`}
      >
        {/* 1. STUDENT NAME */}
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-4">
            <Avatar src={student.photo_url} alt={student.student_name} fallbackText={student.student_name} isInactive={isInactive} size="md" className="shadow-sm" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-slate-800">
                  {student.student_name}
                </span>
                {student.is_verified && <ShieldCheck size={14} className="text-teal-500" title="Verified" />}
              </div>
              <span className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-wide">
                Batch: {student.batch?.batch_name || "N/A"}
              </span>
            </div>
          </div>
        </td>

        {/* 2. BRANCH */}
        <td className="px-6 py-4 hidden sm:table-cell align-middle">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-indigo-400" />
              <span className="text-[13px] font-bold text-slate-700">
                {student.branch?.branch_name || "N/A"}
              </span>
            </div>
          </div>
        </td>

        {/* 3. STUDENT ID */}
        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <span className="text-[13px] font-semibold text-slate-600 tracking-wide">
            {student.student_id}
          </span>
        </td>

        {/* 4. COURSE */}
        <td className="px-6 py-4 hidden lg:table-cell align-middle">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-purple-400" />
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 ml-1" title="Course ID/Code">
              Code: {student.course?.course_code || student.course?._id?.slice(-6).toUpperCase() || "N/A"}
            </span>
            </div>
          </div>
        </td>

        {/* 5. STATUS */}
        <td className="px-6 py-4 align-middle">
          <span className={`text-[13px] font-bold tracking-wide uppercase ${student.is_active ? "text-teal-500" : "text-rose-400"}`}>
            {student.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        {/* 6. ACTIONS (Role Protected) */}
        <td className="px-6 py-4 text-right align-middle">
          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            
            {canCollectFee && (
              <ActionIconButton 
                icon={Wallet} variant="neutral" 
                onClick={() => onPay(student)} 
                title="View Finance & Collect Payment" 
              />
            )}
            
            {canViewDetails && (
              <ActionIconButton icon={Eye} onClick={() => navigate(`/student/${student._id}`)} title="View Details" />
            )}

            {canAddComment && (
              <ActionIconButton icon={MessageSquare} variant="neutral" onClick={() => onAddComment(student)} title="Add Comment" />
            )}

            {canEdit && (
              <>
                <ActionIconButton icon={Edit} variant="neutral" onClick={() => onEdit(student._id)} title="Edit Student" />
                <ActionIconButton icon={student.is_active ? PowerOff : Power} variant="neutral" onClick={() => onToggleStatus(student._id)} disabled={toggleLoading} title={student.is_active ? "Deactivate" : "Activate"} />
              </>
            )}

            {canViewDetails && (
              <>
                <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(student)} title="Generate ID Card" />
                <ActionIconButton
                  icon={isDownloadingThis ? Loader2 : Award}
                  variant="purple"
                  onClick={() => handleDownloadCertificate(student)}
                  disabled={isDownloadingThis}
                  loading={isDownloadingThis}
                  title="Download Certificate"
                />
              </>
            )}

            {canDelete && (
              <ActionIconButton 
                icon={Trash2} 
                variant="danger" 
                onClick={() => handleDeleteClick(student._id, student.student_name)} 
                disabled={deleteLoading} 
                title="Delete Student" 
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={students}
      renderRow={renderStudentRow}
      isLoading={isLoading}
      pagination={pagination}
      page={page}
      onPageChange={onPageChange}
      searchTerm={searchTerm}
      emptyStateTitle="No students found"
    />
  );
};

export default StudentsTable;