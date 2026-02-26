import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useUpdateUserRole,
} from "../../hooks/useUser.js";
import useAuth from "../../store/useAuth.js";
import toast from "react-hot-toast";

import EmployeeQRCodeModal from "../../components/modal/EmployeeQRCodeModal.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import TableSkeleton from "../../components/common/TableSkeleton.jsx";
import DataErrorState from "../../components/common/DataErrorState.jsx";
import EmployeeFilters from "../../components/Search_filter/EmployeeFilters.jsx";
import EmployeesTable from "../../components/table/EmployeesTable.jsx";

// Import Branches Hook
import { useBranches } from "../../hooks/useBranches.js";

const INITIAL_FILTERS = {
  branch: "all", // ADDED BRANCH
  status: "all",
  department: "all",
  role: "all",
  date_from: "",
  date_to: "",
};

const AllEmployees = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const currentUserId = authUser?.id || authUser?._id;

  // Fetch Branches
  const { data: branchesRes } = useBranches();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEmployeeForQr, setSelectedEmployeeForQr] = useState(null);
  const limit = 20;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryFilters = useMemo(() => {
    const activeFilters = {};

    if (debouncedSearch) {
      activeFilters.search = debouncedSearch;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "all" && value !== "") {
        activeFilters[key] = value;
      }
    });

    return activeFilters;
  }, [filters, debouncedSearch]);

  const { data, isLoading, error, refetch, isRefetching } = useUsers(page, limit, queryFilters);
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();
  const updateRoleMutation = useUpdateUserRole();

  const employees = data?.data || [];
  const pagination = data?.pagination;

  // ==========================================
  // INJECT BRANCHES INTO FILTER OPTIONS
  // ==========================================
  const combinedFilterOptions = useMemo(() => {
    return {
      // Only Super Admins see the branch filter dropdown
      branches: authUser?.role === "admin" ? branchesRes?.data || [] : []
    };
  }, [branchesRes?.data, authUser?.role]);

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const handleDelete = (id) => {
    if (id === currentUserId) return toast.error("You cannot delete your own account.");
    deleteUserMutation.mutate(id);
  };

  const handleToggleStatus = (id, currentStatus) => {
    if (id === currentUserId) return toast.error("You cannot change your own status.");
    const newStatus = currentStatus === "Active" ? "On Leave" : "Active";
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleUpdateRole = (id, newRole) => {
    if (id === currentUserId) return toast.error("You cannot change your own role.");
    updateRoleMutation.mutate({ id, role: newRole });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen relative">
      <PageHeader
        title="Employee Directory"
        subtitle="Manage and export staff records."
        showExport={true}
        disableExport={isLoading || employees.length === 0}
        onExport={() => { /* handleExport */ }}
        onAdd={() => navigate("/admin/add-employee")}
        addText="Add Employee"
      />

      <div className="mb-6">
        <EmployeeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilters}
          filterOptions={combinedFilterOptions} // <--- PASSING THE BRANCHES HERE
          initialFilters={INITIAL_FILTERS}
          isLoading={isLoading}
        />
      </div>

      {error ? (
        <DataErrorState
          error={error}
          onRetry={refetch}
          isRetrying={isRefetching}
        />
      ) : (
        <>
          {isLoading ? (
            <TableSkeleton rows={6} />
          ) : (
            <EmployeesTable
              employees={employees}
              currentUserId={currentUserId}
              pagination={pagination}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onUpdateRole={handleUpdateRole}
              onGenerateQR={setSelectedEmployeeForQr}
              onViewProfile={(e) => navigate(`/employee/${e._id}`)}
              onEdit={(id) => navigate(`/admin/update-employee/${id}`)}
              deleteLoading={deleteUserMutation.isPending}
              toggleLoading={updateStatusMutation.isPending}
              roleLoadingId={updateRoleMutation.isPending ? updateRoleMutation.variables?.id : null}
              page={page}
              onPageChange={setPage}
              searchTerm={debouncedSearch}
            />
          )}
        </>
      )}

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