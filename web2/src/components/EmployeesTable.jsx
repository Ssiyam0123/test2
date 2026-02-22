import React from "react";
import { Edit, Trash2, User, Briefcase, Hash, Mail, Phone, Power, PowerOff, Eye, RefreshCw, QrCode } from "lucide-react";
import Loader from "./Loader.jsx";
import { apiURL } from "../../Constant.js";

const BASE_URL = apiURL.image_url || "http://localhost:3030";

const EmployeesTable = ({
  employees, currentUserId, pagination, onDelete, onToggleStatus, onUpdateRole,
  onViewProfile,onGenerateQR, onEdit, deleteLoading, toggleLoading, roleLoadingId, page,
  onPageChange, searchTerm, onClearFilters, filters, isLoading = false,
}) => {
  if (isLoading && (!employees || employees.length === 0)) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center"><Loader /></div>;
  }

  const hasActiveFilters = searchTerm || Object.values(filters || {}).some((f) => f !== "all" && f !== "");

  const getValidImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity & Info</th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Position</th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees?.length > 0 ? (
              employees.map((employee) => {
                const isInactive = employee.status !== "Active";
                const isSelf = employee._id === currentUserId;
                const isRoleUpdating = roleLoadingId === employee._id;

                return (
                  <tr key={employee._id} className={`transition-colors duration-150 ${isInactive ? "bg-gray-50/50" : "hover:bg-gray-50"}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 flex-shrink-0 ${isInactive ? "opacity-60 grayscale" : ""}`}>
                          {employee.photo_url ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                              src={getValidImageUrl(employee.photo_url)} 
                              alt={employee.full_name} 
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-50 border flex items-center justify-center"><User size={18} className="text-blue-500" /></div>
                          )}
                        </div>
                        <div className={`ml-3 ${isInactive ? "opacity-70" : ""}`}>
                          <div className="text-sm font-bold text-gray-900">{employee.full_name}</div>
                          <div className="text-[11px] font-medium text-blue-600 mb-1">@{employee.username}</div>
                          <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono uppercase"><Hash size={10} className="mr-0.5" />{employee.employee_id}</div>
                        </div>
                      </div>
                    </td>

                    <td className={`px-5 py-4 ${isInactive ? "opacity-70" : ""}`}>
                      <div className="space-y-1.5">
                        
                        {/* ROLE DROPDOWN INSTEAD OF BADGE */}
                        <div className="flex items-center gap-2">
                          <select
                            value={employee.role}
                            disabled={isSelf || isRoleUpdating}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              if (newRole !== employee.role) {
                                // Reset the UI visually before the request finishes, React Query will sync it
                                e.target.value = employee.role; 
                                onUpdateRole(employee._id, newRole, employee.full_name);
                              }
                            }}
                            className={`px-2 py-1 text-xs font-bold uppercase rounded-md border outline-none cursor-pointer transition-colors
                              ${employee.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' : 'bg-slate-50 text-slate-700 border-slate-200 focus:ring-slate-500'}
                              ${isSelf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white focus:ring-2'}
                            `}
                          >
                            <option value="admin">Admin</option>
                            <option value="register">Registrar</option>
                            <option value="instructor">Instructor</option>
                            <option value="staff">Staff</option>
                          </select>
                          
                          {/* Spinner for when this specific row is loading */}
                          {isRoleUpdating && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                        </div>

                        <div className="flex items-center text-sm font-medium text-gray-900 mt-1">
                          <Briefcase size={14} className="text-blue-500 mr-2 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{employee.designation}</span>
                        </div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-md">{employee.department}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${employee.status === "Active" ? "bg-green-50 text-green-700" : employee.status === "On Leave" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                        {employee.status}
                      </span>
                    </td>

                    <td className={`px-5 py-4 ${isInactive ? "opacity-70" : ""}`}>
                      <div className="space-y-2">
                        {employee.phone && <div className="flex items-center text-sm text-gray-700"><Phone size={14} className="text-gray-400 mr-2" /><span>{employee.phone}</span></div>}
                        {employee.email && <div className="flex items-center text-sm text-gray-700"><Mail size={14} className="text-gray-400 mr-2" /><span className="truncate max-w-[160px]">{employee.email}</span></div>}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onViewProfile(employee); }} 
                          className="p-2 rounded-md hover:bg-blue-50 text-blue-600 transition"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleStatus(employee._id, employee.status); }}
                          disabled={toggleLoading || isSelf}
                          className={`p-2 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed ${employee.status === 'Active' ? "hover:bg-amber-50 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-green-50"}`}
                          title={employee.status === 'Active' ? "Deactivate" : "Activate"}
                        >
                          {employee.status === 'Active' ? <Power size={18} /> : <PowerOff size={18} />}
                        </button>
<button
                          onClick={(e) => { e.stopPropagation(); onGenerateQR(employee); }}
                          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition"
                          title="Generate QR Code"
                        >
                          <QrCode size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(employee._id); }} 
                          className="p-2 rounded-md hover:bg-emerald-50 text-emerald-600 transition"
                          title="Edit Employee"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(employee._id, employee.full_name); }}
                          disabled={deleteLoading || isSelf}
                          className="p-2 rounded-md hover:bg-red-50 text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete Employee"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-16 text-center">
                  <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
                  {hasActiveFilters && <button onClick={onClearFilters} className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">Clear all filters</button>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {employees?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-xl">
           <div className="text-sm text-gray-600">Showing <span className="font-medium">{employees.length}</span> of <span className="font-medium">{pagination?.total || 0}</span></div>
           <div className="flex items-center space-x-2">
             <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="px-3 py-1.5 text-sm bg-white border rounded-md disabled:opacity-50">Prev</button>
             <button disabled={page === (pagination?.totalPages || 1)} onClick={() => onPageChange(page + 1)} className="px-3 py-1.5 text-sm bg-white border rounded-md disabled:opacity-50">Next</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTable;