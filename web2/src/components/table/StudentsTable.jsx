import React from "react";
import {
  Edit, Trash2, QrCode, Power, PowerOff, Eye, Loader2, MessageSquare, 
  ShieldCheck, Award, MapPin, Wallet, BookOpen, Mail, Download 
} from "lucide-react";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../../store/useAuth.js";
import { PERMISSIONS } from "../../config/permissionConfig.js";
import { confirmDelete } from "../../utils/swalUtils"; 

const StudentsTable = ({
  students, pagination, onDelete, onToggleStatus, 
  onGenerateQR, onAddComment, onEdit, onPay, 
  onSendCertificate, onDownloadCertificate, // 🚀 onDownloadCertificate রিসিভ করা হলো
  deleteLoading, toggleLoading, page, onPageChange, searchTerm, isLoading = false,
}) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const handleDeleteClick = (studentId, studentName) => {
    confirmDelete({
      title: "Delete Student?",
      text: `Are you sure you want to permanently delete ${studentName}? This action cannot be undone.`,
      confirmText: "Yes, delete student",
      onConfirm: () => onDelete(studentId) 
    });
  };

  const canManagePayments = hasPermission(PERMISSIONS.STUDENT_PAYMENTS);
  const canViewProfile = hasPermission(PERMISSIONS.STUDENT_PROFILE);
  const canComment = hasPermission(PERMISSIONS.STUDENT_COMMENT);
  const canEdit = hasPermission(PERMISSIONS.STUDENT_EDIT);
  const canToggleActive = hasPermission(PERMISSIONS.STUDENT_ACTIVE_CONTROL);
  const canGenerateQR = hasPermission(PERMISSIONS.STUDENT_QRCODE);
  const canIssueCertificate = hasPermission(PERMISSIONS.STUDENT_CERTIFICATE);
  const canDelete = hasPermission(PERMISSIONS.STUDENT_DELETE);

  const columns = [
    { label: "Student Name", className: "w-[25%]" },
    { label: "Branch", className: "hidden sm:table-cell w-[15%]" },
    { label: "ID", className: "hidden md:table-cell w-[15%]" },
    { label: "Course", className: "hidden lg:table-cell w-[20%]" },
    { label: "Status", className: "w-[10%]" },
    { label: "Actions", align: "right", className: "w-[15%]" },
  ];

  const renderStudentRow = (student) => {
    const isInactive = !student.is_active;

    return (
      <tr key={student._id} className={`group transition-colors duration-300 hover:bg-slate-50/50 ${isInactive ? "opacity-60 grayscale-[20%]" : ""}`}>
        {/* 1. STUDENT NAME */}
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-4">
            <Avatar src={student.photo_url} alt={student.student_name} fallbackText={student.student_name} isInactive={isInactive} size="md" className="shadow-sm" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-bold text-slate-800">{student.student_name}</span>
                {student.is_verified && <ShieldCheck size={14} className="text-teal-500" title="Verified" />}
              </div>
              <span className="text-[12px] text-slate-400 font-medium mt-0.5 tracking-wide">Batch: {student.batch?.batch_name || "N/A"}</span>
            </div>
          </div>
        </td>

        {/* 2. BRANCH */}
        <td className="px-6 py-4 hidden sm:table-cell align-middle">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-indigo-400" />
            <span className="text-[13px] font-bold text-slate-700">{student.branch?.branch_name || "N/A"}</span>
          </div>
        </td>

        {/* 3. STUDENT ID */}
        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <span className="text-[13px] font-semibold text-slate-600 tracking-wide">{student.student_id}</span>
        </td>

        {/* 4. COURSE */}
        <td className="px-6 py-4 hidden lg:table-cell align-middle">
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} className="text-purple-400" />
            <span className="text-[12px] text-slate-600 font-medium">{student.course?.course_name || "N/A"}</span>
          </div>
        </td>

        {/* 5. STATUS */}
        <td className="px-6 py-4 align-middle">
          <span className={`text-[11px] font-black tracking-widest uppercase px-2 py-1 rounded-md ${student.is_active ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-500"}`}>
            {student.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        <td className="px-6 py-4 text-right align-middle">
          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            
            {canManagePayments && (
              <ActionIconButton icon={Wallet} variant="neutral" onClick={() => onPay(student)} title="Finance & Payments" />
            )}
            
            {canViewProfile && (
              <ActionIconButton icon={Eye} onClick={() => navigate(`/student/${student._id}`)} title="View Details" />
            )}

            {canComment && (
              <ActionIconButton icon={MessageSquare} variant="neutral" onClick={() => onAddComment(student)} title="Add Comment" />
            )}

            {canEdit && (
              <ActionIconButton icon={Edit} variant="neutral" onClick={() => onEdit(student._id)} title="Edit Student" />
            )}

            {canToggleActive && (
              <ActionIconButton icon={student.is_active ? PowerOff : Power} variant="neutral" onClick={() => onToggleStatus(student._id)} disabled={toggleLoading} title={student.is_active ? "Deactivate" : "Activate"} />
            )}

            {canGenerateQR && (
              <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(student)} title="Generate QR Code" />
            )}

            {/* 🚀 Email Certificate */}
            {canIssueCertificate && (
              <ActionIconButton
                icon={Mail}
                variant="indigo"
                onClick={() => onSendCertificate(student)}
                title="Email Certificate"
              />
            )}

            {/* 🚀 Download Certificate */}
            {canIssueCertificate && (
              <ActionIconButton
                icon={Download} // Loader রিমুভ করা হয়েছে কারণ এটা মডালে দেখাবে
                variant="purple"
                onClick={() => onDownloadCertificate(student)} // সরাসরি মিউটেশনের বদলে মডাল ওপেন করবে
                title="Download Certificate PDF"
              />
            )}

            {/* 🗑️ ডিলিট পারমিশন */}
            {canDelete && (
              <ActionIconButton icon={Trash2} variant="danger" onClick={() => handleDeleteClick(student._id, student.student_name)} disabled={deleteLoading} title="Delete Student" />
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