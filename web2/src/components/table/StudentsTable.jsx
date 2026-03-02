import React from "react";
import {
  Edit, Trash2, QrCode, Power, PowerOff, Eye, Loader2, MessageSquare, 
  ShieldCheck, Award, Mail, Phone, MapPin, Wallet
} from "lucide-react";
import { useDownloadCertificate } from "../../hooks/useStudents.js";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";
import { useNavigate } from "react-router-dom";

const StudentsTable = ({
  students, currentUser, pagination, onDelete, onToggleStatus, 
  onGenerateQR, onAddComment,  onEdit, 
  onPay, 
  deleteLoading, toggleLoading, page, onPageChange, searchTerm, isLoading = false,
}) => {
  const downloadMutation = useDownloadCertificate();

  const handleDownloadCertificate = (student) => {
    downloadMutation.mutate(student);
  };

  const navigate = useNavigate()

  const permissions = currentUser?.role?.permissions || currentUser?.permissions || [];
  const roleName = (typeof currentUser?.role === 'string' ? currentUser.role : currentUser?.role?.name || "").toLowerCase();
  
  // Normalizes strings to handle "Edit Student" or "edit_student" equally
  const hasPerm = (p) => permissions.some(v => v.toLowerCase().replace(/\s/g, '_') === p);

  // PBAC Flags (with fallback to your original role structure to prevent UI breakage)
  const isSuper = roleName === "superadmin" || hasPerm("all_access");
  const canManageFinance = isSuper || hasPerm("manage_finance") || hasPerm("manage_payments") || ["admin", "registrar"].includes(roleName);
  const canAddComment = isSuper || hasPerm("add_comment") || hasPerm("edit_student") || ["admin", "registrar", "instructor"].includes(roleName);
  const canEdit = isSuper || hasPerm("edit_student") || hasPerm("update_student") || ["admin", "registrar"].includes(roleName);
  const canDelete = isSuper || hasPerm("delete_student") || ["admin", "registrar"].includes(roleName);

  const columns = [
    { label: "Student Name", className: "w-[25%]" },
    { label: "Branch", className: "hidden sm:table-cell w-[10%]" },
    { label: "ID", className: "hidden md:table-cell w-[12%]" },
    { label: "Course", className: "hidden lg:table-cell w-[18%]" },
    { label: "Balance", className: "hidden xl:table-cell w-[12%]" },
    { label: "Status", className: "w-[8%]" },
    { label: "Actions", align: "right", className: "w-[15%]" },
  ];

  const renderStudentRow = (student) => {
    const isInactive = !student.is_active;
    const isDownloadingThis = downloadMutation.isPending && downloadMutation.variables?._id === student._id;

    const netPayable = student.fee_summary?.net_payable || 0;
    const paidAmount = student.fee_summary?.paid_amount || 0;
    const dueAmount = netPayable - paidAmount;

    return (
      <tr
        key={student._id}
        className={`group transition-colors duration-300 hover:bg-slate-50/50 ${isInactive ? "opacity-60 grayscale-[20%]" : ""}`}
      >
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
                Batch {typeof student.batch === "object" ? student.batch?.batch_name : student.batch || "N/A"}
              </span>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 hidden sm:table-cell align-middle">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-indigo-400" />
            <span className="text-[13px] font-bold text-slate-700">
              {student.branch?.branch_code || student.branch?.name || "N/A"}
            </span>
          </div>
        </td>

        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <span className="text-[13px] font-semibold text-slate-600 tracking-wide">
            {student.student_id}
          </span>
        </td>

        <td className="px-6 py-4 hidden lg:table-cell align-middle">
          <span className="text-[13px] font-medium text-slate-600 line-clamp-1" title={student.course?.course_name}>
            {student.course?.course_name || student.course?.course_code || "N/A"}
          </span>
        </td>

        <td className="px-6 py-4 hidden xl:table-cell align-middle">
          <div className="flex flex-col">
            <span className={`text-[13px] font-black ${dueAmount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
              ৳{dueAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              {dueAmount > 0 ? "Outstanding" : "Settled"}
            </span>
          </div>
        </td>

        <td className="px-6 py-4 align-middle">
          <span className={`text-[13px] font-bold tracking-wide uppercase ${student.is_active ? "text-teal-500" : "text-rose-400"}`}>
            {student.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        <td className="px-6 py-4 text-right align-middle">
          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            
            {/* PBAC: Finance Ledger */}
            {canManageFinance && (
              <ActionIconButton 
                icon={Wallet} 
                variant="neutral" 
                onClick={() => onPay(student)} 
                title={dueAmount <= 0 ? "View Ledger" : "Collect Payment"} 
              />
            )}

            <ActionIconButton icon={Eye} onClick={() => navigate(`/student/${student._id}`)} title="View" />
            
            {/* PBAC: Add Comment */}
            {canAddComment && (
              <ActionIconButton icon={MessageSquare} variant="neutral" onClick={() => onAddComment(student)} title="Comment" />
            )}
            
            {/* PBAC: Manage Student Actions */}
            {(canEdit || canDelete) && (
              <>
                {canEdit && (
                  <ActionIconButton icon={Edit} variant="neutral" onClick={() => onEdit(student._id)} title="Edit" />
                )}
                
                {canEdit && (
                  <ActionIconButton icon={student.is_active ? PowerOff : Power} variant="neutral" onClick={() => onToggleStatus(student._id)} disabled={toggleLoading} title="Toggle Status" />
                )}
                
                <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(student)} title="Generate QR" />
                
                {canDelete && (
                  <ActionIconButton icon={Trash2} variant="danger" onClick={() => onDelete(student._id, student.student_name)} disabled={deleteLoading} title="Delete" />
                )}
              </>
            )}
            
            {/* Allowed for all logged-in users viewing the table */}
            {currentUser && (
              <ActionIconButton
                icon={isDownloadingThis ? Loader2 : Award}
                variant="purple"
                onClick={() => handleDownloadCertificate(student)}
                disabled={isDownloadingThis}
                loading={isDownloadingThis}
                title="Download Certificate"
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