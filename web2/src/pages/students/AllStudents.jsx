import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStudents,
  useDeleteStudent,
  useToggleStudentStatus,
} from "../../hooks/useStudents.js";
import { useConfirmToast } from "../../components/ConfirmToast.jsx";
import StudentFilters from "../../components/Search_filter/StudentFilters.jsx";
import QRCodeModal from "../../components/modal/QRCodeModal.jsx";
import useAuth from "../../store/useAuth.js";

import PageHeader from "../../components/common/PageHeader.jsx";
import TableSkeleton from "../../components/common/TableSkeleton.jsx";
import DataErrorState from "../../components/common/DataErrorState.jsx";
import CommentModal from "../../components/modal/CommentModal.jsx";

// Import Branches Hook
import { useBranches } from "../../hooks/useBranches.js";

const StudentsTable = React.lazy(() => import("../../components/table/StudentsTable.jsx"));

const INITIAL_FILTERS = {
  branch: "all", // ADDED BRANCH
  status: "all", 
  batch: "all", 
  course: "all", 
  competency: "all",
  is_active: "all", 
  is_verified: "all", 
  date_from: "", 
  date_to: "",
};

const AllStudents = () => {
  const navigate = useNavigate();
  const { showConfirmToast } = useConfirmToast();
  const { authUser } = useAuth();
  
  // Fetch Branches
  const { data: branchesRes } = useBranches();
  
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  
  // ==========================================
  // SEARCH LOGIC
  // ==========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [page, setPage] = useState(1);
  const limit = 20;

  // Memoize filters for the API Call
  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };
    
    if (debouncedSearch) {
      activeFilters.search = debouncedSearch;
    }

    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] === "all") delete activeFilters[key];
    });

    return activeFilters;
  }, [filters, debouncedSearch]);

  const { data, isLoading, error, refetch, isRefetching } = useStudents(page, limit, queryFilters);
  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();

  const students = data?.data || [];
  const pagination = data?.pagination;
  

  const combinedFilterOptions = useMemo(() => {
    const baseOptions = data?.filters || {};
    
    // Only pass branches if the user is a Super Admin
    if (authUser?.role === "admin") {
      baseOptions.branches = branchesRes?.data || [];
    } else {
      baseOptions.branches = [];
    }

    return baseOptions;
  }, [data?.filters, branchesRes?.data, authUser?.role]);

  useEffect(() => { 
    setPage(1); 
  }, [queryFilters]);

  const handleDelete = (id, studentName) => {
    showConfirmToast({
      type: "delete",
      title: "Delete Student",
      message: `Are you sure you want to permanently delete`,
      itemName: studentName,
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => await deleteStudentMutation.mutateAsync(id),
    });
  };

  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader 
        title="Student Directory"
        subtitle="Manage and export registered student records."
        showExport={authUser?.role !== "instructor"}
        onExport={() => {/* CSV logic */}}
        onAdd={authUser?.role !== "instructor" ? () => navigate("/admin/add-student") : null}
        addText="Add Student"
      />

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
            students={students}
            currentUser={authUser}
            pagination={pagination}
            onViewDetails={(id) => navigate(`/student/${id}`)}
            onDelete={handleDelete}
            onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr}
            onAddComment={setSelectedStudentForComment}
            onViewProfile={(s) => navigate(`/student/${s._id}`)}
            onEdit={(id) => navigate(`/admin/update-student/${id}`)}
            deleteLoading={deleteStudentMutation.isPending}
            toggleLoading={toggleStatusMutation.isPending}
            page={page}
            onPageChange={setPage}
            searchTerm={debouncedSearch}
            onClearFilters={() => { 
              setFilters(INITIAL_FILTERS); 
              setSearchTerm(""); 
              setDebouncedSearch("");
            }}
            filters={filters}
          />
        )}
      </Suspense>

      {selectedStudentForQr && <QRCodeModal student={selectedStudentForQr} onClose={() => setSelectedStudentForQr(null)} />}
      {selectedStudentForComment && <CommentModal student={selectedStudentForComment} onClose={() => setSelectedStudentForComment(null)} />}
    </div>
  );
};

export default AllStudents;