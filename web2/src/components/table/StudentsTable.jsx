import React, { useState } from "react";
import {
  Edit, Trash2, QrCode, Power, PowerOff, Eye, Loader2, MessageSquare, ShieldCheck, Award, Mail, Phone,
} from "lucide-react";
import { API } from "../../api/axios.js";
import toast from "react-hot-toast";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";

const StudentsTable = ({
  students, currentUser, pagination, onDelete, onToggleStatus, onGenerateQR, onAddComment, onViewDetails, onEdit, deleteLoading, toggleLoading, page, onPageChange, searchTerm, isLoading = false,
}) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadCertificate = async (student) => {
    try {
      setDownloadingId(student._id);
      const response = await API.get(`/generate-certificate/download/${student._id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `CIB_Certificate_${student.student_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { label: "Student Name", className: "w-[30%]" },
    { label: "ID", className: "hidden md:table-cell w-[15%]" },
    { label: "Course", className: "hidden lg:table-cell w-[20%]" },
    { label: "Contact", className: "hidden xl:table-cell w-[15%]" },
    { label: "Status", className: "w-[10%]" },
    { label: "Actions", align: "right", className: "w-[10%]" },
  ];

  const renderStudentRow = (student) => {
    const isInactive = !student.is_active;

    return (
      <tr
        key={student._id}
        className={`group transition-colors duration-300 hover:bg-slate-50/50 ${isInactive ? "opacity-60 grayscale-[20%]" : ""}`}
      >
        {/* 1. Student Name & Avatar */}
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

        {/* 2. ID */}
        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <span className="text-[13px] font-semibold text-slate-600 tracking-wide">
            {student.student_id}
          </span>
        </td>

        {/* 3. Course */}
        <td className="px-6 py-4 hidden lg:table-cell align-middle">
          <span className="text-[13px] font-medium text-slate-600 line-clamp-1" title={student.course_name}>
            {student.course_name}
          </span>
        </td>

        {/* 4. Contact Info */}
        <td className="px-6 py-4 hidden xl:table-cell align-middle">
          <div className="flex flex-col space-y-1">
            {student.contact_number && (
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                <Phone size={11} className="text-slate-400" /> {student.contact_number}
              </span>
            )}
            {student.email && (
              <span className="text-[12px] text-slate-400 truncate max-w-[140px] flex items-center gap-1.5" title={student.email}>
                 <Mail size={11} className="text-slate-400" /> {student.email}
              </span>
            )}
          </div>
        </td>

        {/* 5. Status */}
        <td className="px-6 py-4 align-middle">
          <span className={`text-[13px] font-bold tracking-wide uppercase ${student.is_active ? "text-teal-500" : "text-rose-400"}`}>
            {student.is_active ? "Active" : "Inactive"}
          </span>
        </td>

        {/* 6. Actions (Muted until row hover) */}
        <td className="px-6 py-4 text-right align-middle">
          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <ActionIconButton icon={Eye} onClick={() => onViewDetails(student._id)} title="View" />
            {(currentUser?.role === "admin" || currentUser?.role === "instructor") && (
              <ActionIconButton icon={MessageSquare} variant="neutral" onClick={() => onAddComment(student)} title="Comment" />
            )}
            {currentUser?.role !== "instructor" && (
              <>
                <ActionIconButton icon={Edit} variant="neutral" onClick={() => onEdit(student._id)} title="Edit" />
                <ActionIconButton icon={student.is_active ? PowerOff : Power} variant="neutral" onClick={() => onToggleStatus(student._id)} disabled={toggleLoading} title="Toggle" />
                <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(student)} title="QR" />
                <ActionIconButton icon={Trash2} variant="danger" onClick={() => onDelete(student._id, student.student_name)} disabled={deleteLoading} title="Delete" />
              </>
            )}
            {currentUser && (
              <ActionIconButton
                icon={downloadingId === student._id ? Loader2 : Award}
                variant="purple"
                onClick={() => handleDownloadCertificate(student)}
                disabled={downloadingId === student._id}
                loading={downloadingId === student._id}
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