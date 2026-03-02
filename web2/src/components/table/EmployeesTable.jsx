import React, { useState } from "react";
import {
  Edit, Trash2, Briefcase, Mail, Phone, Power, PowerOff, 
  Eye, QrCode, Award, Loader2, Building2, Shield
} from "lucide-react";
import { API } from "../../api/axios.js";
import toast from "react-hot-toast";
import DataTable from "../common/DataTable.jsx";
import ActionIconButton from "../common/ActionIconButton.jsx";
import Avatar from "../common/Avatar.jsx";
import CanAccess from "../common/CanAccess.jsx"; 
import { PERMISSIONS } from "../../utils/permissions.js";

const EmployeesTable = ({
  employees,
  roles = [], // 🚀 Accepting roles prop for the dropdown
  currentUserId,
  currentUserRole, 
  pagination,
  onDelete,
  onToggleStatus,
  onUpdateRole, 
  onGenerateQR,
  onViewProfile,
  onEdit,
  deleteLoading,
  toggleLoading,
  roleLoadingId,
  page,
  onPageChange,
  searchTerm,
  isLoading = false,
}) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadIDCard = async (employee) => {
    try {
      setDownloadingId(employee._id);
      const response = await API.get(
        `/generate-certificate/employeeid/download/${employee._id}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ID_Card_${employee.employee_id}.pdf`);
      document.body.appendChild(link);
      link.click();
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
    { label: "Employee Identity", className: "w-[30%]" },
    { label: "Campus", className: "hidden sm:table-cell w-[15%]" }, 
    { label: "Position", className: "hidden md:table-cell w-[20%]" },
    { label: "Contact", className: "hidden lg:table-cell w-[20%]" },
    { label: "Status", className: "hidden sm:table-cell w-[10%]" },
    { label: "Role & Actions", align: "right", className: "w-[20%]" },
  ];

  const renderEmployeeRow = (employee) => {
    const isInactive = employee.status !== "Active";
    const isSelf = employee._id === currentUserId;

    // PBAC Data Extraction
    const roleName = employee.role?.name || "Unassigned";
    const isSuperAdmin = roleName.toLowerCase() === "superadmin";

    // Static Badge UI for fallbacks or uneditable roles (Self/Superadmin)
    const StaticRoleBadge = () => (
      <div className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border flex items-center gap-1.5 ${
        isSuperAdmin 
          ? "bg-amber-50 border-amber-200 text-amber-600" 
          : employee.role?.is_system_role
            ? "bg-indigo-50 border-indigo-100 text-indigo-600"
            : "bg-slate-100 border-slate-200 text-slate-600"
      }`}>
        {isSuperAdmin && <Shield size={10} />}
        {roleName}
      </div>
    );

    return (
      <tr
        key={employee._id}
        className={`group transition-colors duration-300 border-b border-slate-50 last:border-none hover:bg-slate-50/50 ${
          isInactive ? "opacity-60 grayscale-[20%]" : ""
        }`}
      >
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-4">
            <Avatar
              src={employee.photo_url}
              alt={employee.username}
              fallbackText={employee.username}
              isInactive={isInactive}
              size="md"
              className="shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-800">
                {employee.full_name}
              </span>
              <div className="flex items-center gap-2 mt-0.5 text-[12px] text-slate-400 font-medium tracking-wide">
                <span>ID: {employee.employee_id}</span>
                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                <span className="text-blue-500 font-semibold tracking-tight">
                  @{employee.username}
                </span>
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 hidden sm:table-cell align-middle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
              <Building2 size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-700">
                {employee.branch?.branch_name || "Global HQ"}
              </span>
              {employee.branch?.branch_code && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {employee.branch.branch_code}
                </span>
              )}
            </div>
          </div>
        </td>

        <td className="px-6 py-4 hidden md:table-cell align-middle">
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-slate-600 line-clamp-1 flex items-center gap-1.5">
              <Briefcase size={12} className="text-slate-400" />{" "}
              {employee.designation || "N/A"}
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 mt-1">
              {employee.department || "No Department"}
            </span>
          </div>
        </td>

        <td className="px-6 py-4 hidden lg:table-cell align-middle">
          <div className="flex flex-col space-y-1">
            {employee.phone && (
              <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
                <Phone size={11} className="text-slate-400" /> {employee.phone}
              </span>
            )}
            {employee.email && (
              <span
                className="text-[12px] text-slate-400 truncate max-w-[150px] flex items-center gap-1.5"
                title={employee.email}
              >
                <Mail size={11} className="text-slate-400" /> {employee.email}
              </span>
            )}
          </div>
        </td>

        <td className="px-6 py-4 hidden sm:table-cell align-middle">
          <span
            className={`text-[13px] font-bold tracking-wide uppercase ${
              employee.status === "Active"
                ? "text-teal-500"
                : employee.status === "On Leave"
                  ? "text-amber-500"
                  : "text-rose-400"
            }`}
          >
            {employee.status}
          </span>
        </td>

        <td className="px-6 py-4 text-right align-middle">
          <div className="flex flex-col items-end gap-2">
            
            {/* 🚀 ROLE DROPDOWN VIA CanAccess */}
            <div className="flex items-center gap-2">
              {roleLoadingId === employee._id && <Loader2 size={12} className="animate-spin text-indigo-500" />}
              
              <CanAccess permission={PERMISSIONS.EDIT_EMPLOYEE} fallback={<StaticRoleBadge />}>
                {isSelf || isSuperAdmin ? (
                  <StaticRoleBadge /> // Cannot edit own role or superadmin's role
                ) : (
                  <select
                    value={employee.role?._id || ""}
                    onChange={(e) => onUpdateRole(employee._id, e.target.value)}
                    disabled={roleLoadingId === employee._id}
                    className="cursor-pointer appearance-none px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border bg-slate-50 border-slate-200 text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all hover:bg-slate-100"
                    style={{
                      paddingRight: '1.75rem',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.25rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2em 1.2em',
                    }}
                  >
                    <option value="" disabled>Select Role</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </CanAccess>
            </div>

            {/* 🚀 DYNAMIC PBAC ACTIONS */}
            <div className="flex items-center justify-end flex-wrap gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
              <ActionIconButton icon={Eye} onClick={() => onViewProfile(employee)} title="View Profile" variant="neutral" />
              
              <ActionIconButton
                icon={downloadingId === employee._id ? Loader2 : Award}
                variant="neutral"
                onClick={() => handleDownloadIDCard(employee)}
                disabled={downloadingId === employee._id}
                loading={downloadingId === employee._id}
                title="Download ID Card"
              />
              <ActionIconButton icon={QrCode} variant="neutral" onClick={() => onGenerateQR(employee)} title="Digital QR" />

              <CanAccess permission={PERMISSIONS.EDIT_EMPLOYEE}>
                <ActionIconButton
                  icon={employee.status === "Active" ? PowerOff : Power}
                  variant="neutral"
                  disabled={isSelf}
                  onClick={() => onToggleStatus(employee._id, employee.status)}
                  title="Toggle Status"
                />
                <ActionIconButton icon={Edit} variant="neutral" onClick={() => onEdit(employee._id)} title="Edit" />
              </CanAccess>

              <CanAccess permission={PERMISSIONS.DELETE_EMPLOYEE}>
                <ActionIconButton
                  icon={Trash2}
                  variant="danger"
                  disabled={isSelf || isSuperAdmin} 
                  onClick={() => onDelete(employee._id, employee.full_name)}
                  title="Delete"
                />
              </CanAccess>
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
      emptyStateSubtitle="There are no employees matching your current filters or search criteria."
    />
  );
};

export default EmployeesTable;