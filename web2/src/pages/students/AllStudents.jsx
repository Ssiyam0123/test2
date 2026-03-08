import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  useStudents,
  useDeleteStudent,
  useToggleStudentStatus,
} from "../../hooks/useStudents.js";
import { useBatches } from "../../hooks/useBatches.js";
import { useActiveCourses } from "../../hooks/useCourses.js";
import { useBranches } from "../../hooks/useBranches.js";
import StudentFilters from "../../components/Search_filter/StudentFilters.jsx";
import BranchDropdown from "../../components/common/BranchDropdown.jsx";
import QRCodeModal from "../../components/modal/QRCodeModal.jsx";
import CommentModal from "../../components/modal/CommentModal.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import TableSkeleton from "../../components/common/TableSkeleton.jsx";
import DataErrorState from "../../components/common/DataErrorState.jsx";
import useAuth from "../../store/useAuth.js";
import PermissionGuard from "../../components/common/PermissionGuard.jsx";
import { PERMISSIONS } from "../../config/permissionConfig.js";

const StudentsTable = React.lazy(
  () => import("../../components/table/StudentsTable.jsx"),
);

const INITIAL_FILTERS = {
  status: "all",
  batch: "all",
  course: "all",
  is_active: "all",
  is_verified: "all",
  date_from: "",
  date_to: "",
};

const AllStudents = () => {
  const navigate = useNavigate();
  const { authUser, isMaster } = useAuth();

  const context = useOutletContext() || {};
  const branchId =
    context.branchId || authUser?.branch?._id || authUser?.branch;

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [superAdminBranchFilter, setSuperAdminBranchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] =
    useState(null);

  const limit = 20;
  const isSuper = isMaster();

  const effectiveBranchId = useMemo(() => {
    if (isSuper)
      return superAdminBranchFilter === "all" ? null : superAdminBranchFilter;
    return branchId;
  }, [isSuper, superAdminBranchFilter, branchId]);

  const { data: batchesRes } = useBatches(
    effectiveBranchId ? { branch: effectiveBranchId } : {},
  );
  const { data: courses = [] } = useActiveCourses();
  const { data: branches = [] } = useBranches({}, { enabled: isSuper }); // Directly an array

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };

    if (!isSuper) {
      activeFilters.branch = branchId;
    } else if (superAdminBranchFilter !== "all") {
      activeFilters.branch = superAdminBranchFilter;
    }

    if (debouncedSearch) activeFilters.search = debouncedSearch;

    Object.keys(activeFilters).forEach((key) => {
      if (activeFilters[key] === "all" || activeFilters[key] === "")
        delete activeFilters[key];
    });

    return activeFilters;
  }, [filters, debouncedSearch, branchId, isSuper, superAdminBranchFilter]);

  // 3. Fetching Main Student Data
  const {
    data: studentsRes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useStudents(page, limit, queryFilters, {
    enabled: isSuper ? true : !!branchId,
  });

  const combinedFilterOptions = useMemo(
    () => ({
      batches: batchesRes?.data || [],
      courses: courses,
    }),
    [batchesRes, courses],
  );

  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const handleBranchChange = (newBranch) => {
    setSuperAdminBranchFilter(newBranch);
    setFilters((prev) => ({ ...prev, batch: "all", course: "all" }));
  };

  if (error)
    return (
      <DataErrorState
        error={error}
        onRetry={refetch}
        isRetrying={isRefetching}
      />
    );
  if (!isSuper && !branchId)
    return (
      <div className="p-6">
        <TableSkeleton rows={8} />
      </div>
    );

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader
        title="Student Directory"
        subtitle={`Viewing ${isSuper ? "All Campuses" : "Your Campus"} Records`}
        onAdd={() => navigate("/admin/add-student")}
        addText="Add Student"
        addPermission={PERMISSIONS.ADD_STUDENT}
      />

      <div className="mb-6 space-y-4">
        <PermissionGuard requiredPermission={PERMISSIONS.VIEW_BRANCHES}>
          {isSuper && (
            <div className="flex justify-end">
              <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-200">
                <BranchDropdown
                  isMaster={isSuper}
                  branches={branches}
                  value={superAdminBranchFilter}
                  onChange={handleBranchChange}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          )}
        </PermissionGuard>

        <StudentFilters
          filters={filters}
          onFilterChange={setFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterOptions={combinedFilterOptions}
          initialFilters={INITIAL_FILTERS}
          isLoading={isLoading}
        />
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <StudentsTable
            students={studentsRes?.data || []}
            pagination={studentsRes?.pagination}
            onDelete={(id) => deleteStudentMutation.mutate(id)}
            onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr}
            onAddComment={setSelectedStudentForComment}
            onPay={(student) =>
              navigate(`/admin/student-finance/${student._id}`)
            }
            onEdit={(id) => navigate(`/admin/update-student/${id}`)}
            page={page}
            onPageChange={setPage}
            searchTerm={debouncedSearch}
            isLoading={isLoading || isRefetching}
            deleteLoading={deleteStudentMutation.isPending}
            toggleLoading={toggleStatusMutation.isPending}
          />
        )}
      </Suspense>

      {selectedStudentForQr && (
        <QRCodeModal
          student={selectedStudentForQr}
          onClose={() => setSelectedStudentForQr(null)}
        />
      )}
      {selectedStudentForComment && (
        <CommentModal
          student={selectedStudentForComment}
          onClose={() => setSelectedStudentForComment(null)}
        />
      )}
    </div>
  );
};

export default AllStudents;