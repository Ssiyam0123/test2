import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useStudents, useDeleteStudent, useToggleStudentStatus } from "../../hooks/useStudents.js";

// FINANCE INTEGRATION
import { useBatches } from "../../hooks/useBatches.js"; 
import { useActiveCourses } from "../../hooks/useCourses.js";
import { useBranches } from "../../hooks/useBranches.js"; 

import { useConfirmToast } from "../../components/ConfirmToast.jsx";
import StudentFilters from "../../components/Search_filter/StudentFilters.jsx";
import QRCodeModal from "../../components/modal/QRCodeModal.jsx";
import CollectPaymentModal from "../../components/modal/CollectPaymentModal.jsx";
import useAuth from "../../store/useAuth.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import TableSkeleton from "../../components/common/TableSkeleton.jsx";
import DataErrorState from "../../components/common/DataErrorState.jsx";
import CommentModal from "../../components/modal/CommentModal.jsx";

const StudentsTable = React.lazy(() => import("../../components/table/StudentsTable.jsx"));

// ==========================================
// ROLE-BASED ACCESS ARRAYS
// ==========================================
const IS_SUPERADMIN = ["superadmin"];
const CAN_ADD_STUDENT = ["superadmin", "admin", "registrar"];

const INITIAL_FILTERS = {
  branch: "all",
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
  
  const context = useOutletContext() || {}; 
  const { branchId } = context; 

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  
  // MODAL STATES
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null);
  const [paymentData, setPaymentData] = useState(null); 
  
  const limit = 20;

  // Role booleans for cleaner ternary checks
  const isSuperadmin = IS_SUPERADMIN.includes(authUser?.role);
  const canAddStudent = CAN_ADD_STUDENT.includes(authUser?.role);

  const effectiveBranchId = useMemo(() => {
    if (isSuperadmin) {
      return filters.branch === "all" ? null : filters.branch; 
    }
    return branchId;
  }, [isSuperadmin, filters.branch, branchId]);

  const { data: batchesRes } = useBatches(effectiveBranchId ? { branch: effectiveBranchId } : {});
  const { data: coursesRes } = useActiveCourses(effectiveBranchId ? { branch: effectiveBranchId } : {});
  const { data: branchesRes } = useBranches(); 
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };
    if (!isSuperadmin) {
      activeFilters.branch = branchId; 
    } else if (activeFilters.branch === "all") {
      delete activeFilters.branch;
    }

    if (debouncedSearch) activeFilters.search = debouncedSearch;
    
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] === "all") delete activeFilters[key];
    });
    
    return activeFilters;
  }, [filters, debouncedSearch, branchId, isSuperadmin]);

  const { data, isLoading, error, refetch, isRefetching } = useStudents(page, limit, queryFilters, {
    enabled: isSuperadmin ? true : !!branchId 
  });

  const combinedFilterOptions = useMemo(() => {
    return {
      batches: batchesRes?.data || [],
      courses: coursesRes?.data || [],
      branches: isSuperadmin ? (branchesRes?.data || []) : []
    };
  }, [batchesRes, coursesRes, branchesRes, isSuperadmin]);

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

  if (!isSuperadmin && !branchId) return <div className="p-6"><TableSkeleton rows={8} /></div>;
  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader 
        title="Student Directory" 
        subtitle="Manage academic and financial records." 
        // RBAC applied to the Add button logic
        onAdd={canAddStudent ? () => navigate("/admin/add-student") : undefined} 
        addText={canAddStudent ? "Add Student" : undefined} 
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
            students={data?.data || []} 
            currentUser={authUser} 
            pagination={data?.pagination}
            onDelete={handleDelete} 
            onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr} 
            onAddComment={setSelectedStudentForComment}
            onPay={(student) => setPaymentData({
              studentId: student._id,
              studentName: student.student_name
            })}
            onEdit={(id) => navigate(`/admin/update-student/${id}`)}
            page={page} 
            onPageChange={setPage} 
            searchTerm={debouncedSearch}
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

      {paymentData && (
        <CollectPaymentModal
          isOpen={!!paymentData}
          onClose={() => setPaymentData(null)}
          studentId={paymentData.studentId}
          studentName={paymentData.studentName}
        />
      )}
    </div>
  );
};

export default AllStudents;