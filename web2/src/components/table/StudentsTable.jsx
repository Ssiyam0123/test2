import React, { useState } from "react";
import { Edit, Trash2, QrCode, Power, PowerOff, Eye, Loader2, MessageSquare, Shield, Award, Mail, Phone, BookOpen } from "lucide-react";
import { API } from "../../api/axios.js";
import toast from "react-hot-toast";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx"; // <-- Make sure to import Avatar!

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

  // 1. ADD RESPONSIVE CLASSES TO HIDE MIDDLE COLUMNS ON MOBILE
  const columns = [
    { label: "Identity" }, // Always visible
    { label: "Academic Info", className: "hidden md:table-cell" }, // Hides on mobile
    { label: "Contact Info", className: "hidden lg:table-cell" },  // Hides on mobile & small tablets
    { label: "Status" }, // Always visible
    { label: "Actions", align: "right" } // Always visible
  ];

  const renderStudentRow = (student) => {
    const isInactive = !student.is_active;

    return (
      <tr key={student._id} className={`transition-colors duration-150 ${isInactive ? "bg-gray-50/50" : "hover:bg-gray-50"}`}>
        
        {/* 1. Identity (Name, Image, ID, Batch) - ALWAYS VISIBLE */}
        <td className="px-5 py-4">
          <div className="flex items-center">
            <Avatar 
              src={student.photo_url} 
              alt={student.student_name} 
              fallbackText={student.student_name} 
              isInactive={isInactive} 
            />
            <div className={`ml-3 ${isInactive ? "opacity-70" : ""}`}>
              <div className="text-sm font-semibold text-gray-900">{student.student_name}</div>
              <div className="flex items-center mt-1 space-x-2 text-[11px] text-gray-500 font-mono">
                <span>ID: {student.student_id}</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
<span className="text-blue-600 font-medium">
  Batch {typeof student.batch === 'object' ? student.batch?.batch_name : student.batch || "N/A"}
</span>
              </div>
            </div>
          </div>
        </td>

        {/* 2. Academic (Course & Reg Num) - HIDDEN ON MOBILE */}
        <td className={`px-5 py-4 hidden md:table-cell ${isInactive ? "opacity-70" : ""}`}>
           <div className="text-sm text-gray-900 font-medium flex items-center">
             <BookOpen size={14} className="text-blue-500 mr-1.5"/> 
             <span className="truncate max-w-[180px]" title={student.course_name}>{student.course_name}</span>
           </div>
           {student.registration_number && (
             <div className="text-xs text-gray-500 mt-1 font-mono">Reg: {student.registration_number}</div>
           )}
        </td>

        {/* 3. Contact (Email & Number) - HIDDEN ON MOBILE & TABLET */}
        <td className={`px-5 py-4 hidden lg:table-cell ${isInactive ? "opacity-70" : ""}`}>
           {student.contact_number && <div className="flex items-center text-sm text-gray-700"><Phone size={14} className="text-gray-400 mr-2" />{student.contact_number}</div>}
           {student.email && <div className="flex items-center text-sm text-gray-700 mt-1"><Mail size={14} className="text-gray-400 mr-2" />{student.email}</div>}
        </td>

        {/* 4. Status (Active/Verified) - ALWAYS VISIBLE */}
        <td className="px-5 py-4">
           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${student.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
             {student.is_active ? "Active" : "Inactive"}
           </span>
           {/* Hide verification badge on extra small screens to save space */}
           {student.is_verified && <div className="hidden sm:flex items-center text-blue-600 font-medium text-[10px] mt-1.5"><Shield size={10} className="mr-1"/> Verified</div>}
        </td>

        {/* 5. Actions - ALWAYS VISIBLE (Uses flex-wrap so buttons don't overflow screen) */}
        <td className="px-5 py-4 text-right">
          <div className="flex items-center justify-end flex-wrap gap-1.5 min-w-[100px]">
            <ActionIconButton icon={Eye} onClick={() => onViewDetails(student._id)} title="View Profile" />
            
            {(currentUser?.role === "admin" || currentUser?.role === "instructor") && (
              <ActionIconButton icon={MessageSquare} variant="purple" onClick={() => onAddComment(student)} title="Add Comment" />
            )}

            {currentUser?.role !== "instructor" && (
              <>
                <ActionIconButton icon={student.is_active ? Power : PowerOff} variant={student.is_active ? "activeToggle" : "inactiveToggle"} onClick={() => onToggleStatus(student._id)} disabled={toggleLoading} title="Toggle Status" />
                <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(student)} title="QR Code" />
                <ActionIconButton icon={Edit} variant="success" onClick={() => onEdit(student._id)} title="Edit" />
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
                title="Certificate" 
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