import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Download, AlertCircle, RefreshCw, Plus } from "lucide-react";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useUpdateUserRole
} from "../hooks/useUser.js";
import { useConfirmToast } from "../components/ConfirmToast";
import useAuth from "../store/useAuth.js";
import EmployeeQRCodeModal from "../components/EmployeeQRCodeModal.jsx"; // <-- Import Modal

const EmployeesTable = React.lazy(() => import("../components/EmployeesTable.jsx"));

const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="bg-gray-50 h-12 w-full border-b border-gray-200" />
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100">
        <div className="rounded-full bg-gray-200 h-10 w-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-8 bg-gray-100 rounded w-24" />
      </div>
    ))}
  </div>
);

const INITIAL_FILTERS = {
  status: "all", department: "all", designation: "all", role: "all", date_from: "", date_to: "",
};

const AllEmployees = () => {
  const navigate = useNavigate();
  const { showConfirmToast } = useConfirmToast();
  const { authUser } = useAuth(); 
  const currentUserId = authUser?.id || authUser?._id;

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEmployeeForQr, setSelectedEmployeeForQr] = useState(null); // <-- QR Modal State
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(searchTerm); }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryFilters = useMemo(
    () => ({ ...filters, ...(debouncedSearch && { search: debouncedSearch }) }),
    [filters, debouncedSearch]
  );

  const { data, isLoading: employeesLoading, error, refetch, isRefetching } = useUsers(page, limit, queryFilters);
  
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  const employees = data?.data || [];
  const pagination = data?.pagination;

  useEffect(() => { setPage(1); }, [queryFilters]);

  const handleDelete = (id, employeeName) => {
    if (id === currentUserId) return; 
    showConfirmToast({
      type: "delete", title: "Delete Employee Account", message: `Are you sure you want to permanently delete`,
      itemName: employeeName, confirmText: "Delete", confirmColor: "red",
      onConfirm: async () => await deleteUserMutation.mutateAsync(id),
    });
  };

  const handleToggleStatus = (id, currentStatus) => {
    if (id === currentUserId) return; 
    const newStatus = currentStatus === "Active" ? "On Leave" : "Active";
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleUpdateRole = (id, newRole, employeeName) => {
    if (id === currentUserId) return; 
    showConfirmToast({
      type: "warning", title: "Change Employee Role", message: `Are you sure you want to change the role for`,
      itemName: `${employeeName} to ${newRole.toUpperCase()}?`, confirmText: "Change Role", confirmColor: "blue",
      onConfirm: async () => await updateRoleMutation.mutateAsync({ id, role: newRole }),
    });
  };

  // ... (handleExport remains the same)
  const handleExport = () => { /* ... existing export logic ... */ };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-gray-500">Manage and export staff records.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button onClick={handleExport} disabled={employeesLoading || employees.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50">
            <Download size={16} /> <span>Export CSV</span>
          </button>
          <button onClick={() => navigate("/admin/add-employee")} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm">
            <Plus size={16} /> <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <input type="text" placeholder="Search by name, username, ID, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-red-800">Connection Error</h3>
          <p className="text-sm text-red-600 text-center max-w-xs">{error.message}</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} /> Try Again
          </button>
        </div>
      ) : (
        <div className="relative">
          {isRefetching && !employeesLoading && <div className="absolute top-0 right-0 p-4 z-10"><RefreshCw size={18} className="animate-spin text-blue-500" /></div>}
          <Suspense fallback={<TableSkeleton />}>
            {employeesLoading ? <TableSkeleton /> : (
              <EmployeesTable
                employees={employees}
                currentUserId={currentUserId}
                pagination={pagination}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onUpdateRole={handleUpdateRole}
                onGenerateQR={setSelectedEmployeeForQr} // <-- Pass handler down
                onViewProfile={(e) => navigate(`/employee/${e._id}`)}
                onEdit={(id) => navigate(`/admin/update-employee/${id}`)}
                deleteLoading={deleteUserMutation.isPending}
                toggleLoading={updateStatusMutation.isPending}
                roleLoadingId={updateRoleMutation.isPending ? updateRoleMutation.variables?.id : null}
                page={page}
                onPageChange={setPage}
                searchTerm={debouncedSearch}
                onClearFilters={() => { setFilters(INITIAL_FILTERS); setSearchTerm(""); }}
                filters={filters}
              />
            )}
          </Suspense>
        </div>
      )}

      {/* Render the QR Modal if an employee is selected */}
      {selectedEmployeeForQr && (
        <EmployeeQRCodeModal 
          employee={selectedEmployeeForQr} 
          onClose={() => setSelectedEmployeeForQr(null)} 
        />
      )}
    </div>
  );
};

export default AllEmployees;