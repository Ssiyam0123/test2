import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useStudents, useDeleteStudent, useToggleStudentStatus } from "../../hooks/useStudents.js";

// IMPORT HOOKS
import { useBatches } from "../../hooks/useBatches.js"; 
import { useActiveCourses } from "../../hooks/useCourses.js";
import { useBranches } from "../../hooks/useBranches.js"; // Brought this back for Superadmin

import { useConfirmToast } from "../../components/ConfirmToast.jsx";
import StudentFilters from "../../components/Search_filter/StudentFilters.jsx";
import QRCodeModal from "../../components/modal/QRCodeModal.jsx";
import useAuth from "../../store/useAuth.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import TableSkeleton from "../../components/common/TableSkeleton.jsx";
import DataErrorState from "../../components/common/DataErrorState.jsx";
import CommentModal from "../../components/modal/CommentModal.jsx";

const StudentsTable = React.lazy(() => import("../../components/table/StudentsTable.jsx"));

const INITIAL_FILTERS = {
  branch: "all", // Restored branch filter state
  status: "all", batch: "all", course: "all", competency: "all",
  is_active: "all", is_verified: "all", date_from: "", date_to: "",
};

const AllStudents = () => {
  const navigate = useNavigate();
  const { showConfirmToast } = useConfirmToast();
  const { authUser } = useAuth();
  
  // 1. GATEKEEPER CONTEXT
  const context = useOutletContext() || {}; 
  const { branchId } = context; 

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null);
  const limit = 20;

  // 2. THE SMART BRANCH CALCULATOR
  // This decides which branch's batches/courses to load into the dropdowns
  const effectiveBranchId = useMemo(() => {
    if (authUser?.role === "superadmin") {
      // If superadmin selects "all" in the filter, pass null to fetch ALL batches
      return filters.branch === "all" ? null : filters.branch; 
    }
    return branchId; // Lock standard users to the gatekeeper
  }, [authUser?.role, filters.branch, branchId]);

  // 3. FETCH DYNAMIC DATA
  // If effectiveBranchId is null, it passes an empty object to fetch everything globally
  const { data: batchesRes } = useBatches(effectiveBranchId ? { branch: effectiveBranchId } : {});
  const { data: coursesRes } = useActiveCourses(effectiveBranchId ? { branch: effectiveBranchId } : {});
  const { data: branchesRes } = useBranches(); 
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 4. PREPARE QUERY FOR STUDENTS TABLE
  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };
    
    if (authUser?.role !== "superadmin") {
      // Unconditional lock for non-superadmins
      activeFilters.branch = branchId; 
    } else {
      // If superadmin picked "all", remove the branch filter so backend returns everyone
      if (activeFilters.branch === "all") delete activeFilters.branch;
    }

    if (debouncedSearch) activeFilters.search = debouncedSearch;
    
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] === "all") delete activeFilters[key];
    });
    
    return activeFilters;
  }, [filters, debouncedSearch, branchId, authUser?.role]);

  const { data, isLoading, error, refetch, isRefetching } = useStudents(page, limit, queryFilters, {
    enabled: authUser?.role === "superadmin" ? true : !!branchId // Only wait for branchId if NOT superadmin
  });

  // 5. BUILD THE FILTER OPTIONS FOR THE UI
  const combinedFilterOptions = useMemo(() => {
    return {
      batches: batchesRes?.data || [],
      courses: coursesRes?.data || [],
      // ONLY pass branches array to UI if user is superadmin
      branches: authUser?.role === "superadmin" ? (branchesRes?.data || []) : []
    };
  }, [batchesRes, coursesRes, branchesRes, authUser?.role]);

  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();

  const handleDelete = (id, studentName) => {
    showConfirmToast({
      type: "delete", title: "Delete Student",
      message: `Are you sure you want to permanently delete`,
      itemName: studentName, confirmText: "Delete", confirmColor: "red",
      onConfirm: async () => await deleteStudentMutation.mutateAsync(id),
    });
  };

  // Guard for standard admins
  if (authUser?.role !== "superadmin" && !branchId) return <div className="p-6"><TableSkeleton rows={8} /></div>;
  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader title="Student Directory" subtitle="Manage records." onAdd={() => navigate("/admin/add-student")} addText="Add Student" />
      
      <div className="mb-6">
        <StudentFilters 
          onFilterChange={setFilters} 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          filterOptions={combinedFilterOptions} 
          initialFilters={filters} 
          isLoading={isLoading} 
        />
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        {isLoading ? <TableSkeleton rows={8} /> : (
          <StudentsTable
            students={data?.data || []} currentUser={authUser} pagination={data?.pagination}
            onDelete={handleDelete} onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr} onAddComment={setSelectedStudentForComment}
            onEdit={(id) => navigate(`/admin/update-student/${id}`)}
            page={page} onPageChange={setPage} searchTerm={debouncedSearch}
          />
        )}
      </Suspense>
      {selectedStudentForQr && <QRCodeModal student={selectedStudentForQr} onClose={() => setSelectedStudentForQr(null)} />}
      {selectedStudentForComment && <CommentModal student={selectedStudentForComment} onClose={() => setSelectedStudentForComment(null)} />}
    </div>
  );
};

export default AllStudents;