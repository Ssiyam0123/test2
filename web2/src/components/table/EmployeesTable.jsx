import React, { useState } from "react";
import { 
  Edit, Trash2, Briefcase, Mail, Phone, Power, PowerOff, 
  Eye, RefreshCw, QrCode, Award, Loader2 
} from "lucide-react";
import { API } from "../../api/axios.js"; // Using your API instance
import toast from "react-hot-toast";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";

const EmployeesTable = ({
  employees, currentUserId, pagination, onDelete, onToggleStatus, onUpdateRole, 
  onGenerateQR, onViewProfile, onEdit, deleteLoading, toggleLoading, 
  roleLoadingId, page, onPageChange, searchTerm, isLoading = false,
}) => {
  
  // State to track which specific ID card is being generated/downloaded
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadIDCard = async (employee) => {
    try {
      setDownloadingId(employee._id);
      
      // Hits your new backend endpoint
      const response = await API.get(`/generate-certificate/employeeid/download/${employee._id}`, { 
        responseType: "blob" 
      });

      // Create blob link to force download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ID_Card_${employee.employee_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("ID Card generated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate ID Card");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { label: "Identity & Info" },
    { label: "Position", className: "hidden md:table-cell" },
    { label: "Contact", className: "hidden lg:table-cell" },
    { label: "Status", className: "hidden sm:table-cell" },
    { label: "Role & Actions", align: "right" }
  ];

  const renderEmployeeRow = (employee) => {
    const isInactive = employee.status !== "Active";
    const isSelf = employee._id === currentUserId;
    const isRoleUpdating = roleLoadingId === employee._id;
    const isDownloading = downloadingId === employee._id;

    return (
      <tr key={employee._id} className={`transition-colors duration-150 ${isInactive ? "bg-gray-50/50" : "hover:bg-gray-50"}`}>
        
        {/* 1. Identity & Info */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar 
              src={employee.photo_url} 
              alt={employee.username} 
              fallbackText={employee.username} 
              isInactive={isInactive} 
            />
            <div className={isInactive ? "opacity-70" : ""}>
              <div className="text-sm font-bold text-gray-900">{employee.full_name}</div>
              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-0.5">
                <span>ID: {employee.employee_id}</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span className="text-blue-600 font-medium">@{employee.username}</span>
              </div>
            </div>
          </div>
        </td>

        {/* 2. Position */}
        <td className={`px-5 py-4 hidden md:table-cell ${isInactive ? "opacity-70" : ""}`}>
           <div className="flex items-center text-sm font-medium">
             <Briefcase size={14} className="text-blue-500 mr-2" />{employee.designation}
           </div>
           <div className="text-xs text-gray-500 mt-1">
             <span className="bg-gray-100 px-2 py-0.5 rounded-md">{employee.department}</span>
           </div>
        </td>

        {/* 3. Contact */}
        <td className={`px-5 py-4 hidden lg:table-cell ${isInactive ? "opacity-70" : ""}`}>
           {employee.phone && (
             <div className="flex items-center text-sm">
               <Phone size={14} className="text-gray-400 mr-2" />{employee.phone}
             </div>
           )}
           {employee.email && (
             <div className="flex items-center text-sm mt-1">
               <Mail size={14} className="text-gray-400 mr-2" />
               <span className="truncate max-w-[160px]" title={employee.email}>{employee.email}</span>
             </div>
           )}
        </td>

        {/* 4. Status */}
        <td className={`px-5 py-4 hidden sm:table-cell`}>
           <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${employee.status === "Active" ? "bg-green-50 text-green-700" : employee.status === "On Leave" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
             {employee.status}
           </span>
        </td>

        {/* 5. Role & Actions */}
        <td className="px-5 py-4 text-right">
           <div className="flex flex-col items-end gap-2">
             
             <div className="flex items-center gap-2">
               {isRoleUpdating && <RefreshCw size={14} className="animate-spin text-blue-500" />}
               <select
                 value={employee.role}
                 disabled={isSelf || isRoleUpdating}
                 onChange={(e) => onUpdateRole(employee._id, e.target.value, employee.full_name)}
                 className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md border outline-none cursor-pointer ${employee.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-700'} ${isSelf ? 'opacity-50' : 'hover:bg-white'}`}
               >
                 <option value="admin">Admin</option>
                 <option value="register">Registrar</option>
                 <option value="instructor">Instructor</option>
                 <option value="staff">Staff</option>
               </select>
             </div>

             <div className="flex items-center justify-end flex-wrap gap-1.5 min-w-[100px]">
               <ActionIconButton icon={Eye} onClick={() => onViewProfile(employee)} title="View" />
               
               {/* New Download Action */}
               <ActionIconButton 
                 icon={isDownloading ? Loader2 : Award} 
                 variant="purple" 
                 onClick={() => handleDownloadIDCard(employee)} 
                 disabled={isDownloading} 
                 loading={isDownloading} 
                 title="Download ID Card" 
               />

               <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(employee)} title="Digital QR" />
               <ActionIconButton icon={employee.status === 'Active' ? Power : PowerOff} variant={employee.status === 'Active' ? "activeToggle" : "inactiveToggle"} disabled={isSelf} onClick={() => onToggleStatus(employee._id, employee.status)} title="Toggle Status" />
               <ActionIconButton icon={Edit} variant="success" onClick={() => onEdit(employee._id)} title="Edit" />
               <ActionIconButton icon={Trash2} variant="danger" disabled={isSelf} onClick={() => onDelete(employee._id, employee.full_name)} title="Delete" />
             </div>
           </div>
        </td>
      </tr>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={employees}
      renderRow={renderEmployeeRow}
      isLoading={isLoading}
      pagination={pagination}
      page={page}
      onPageChange={onPageChange}
      searchTerm={searchTerm}
      emptyStateTitle="No employees found"
    />
  );
};

export default EmployeesTable;