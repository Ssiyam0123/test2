import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useStudents, useDeleteStudent, useToggleStudentStatus } from "../../hooks/useStudents.js";
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

const INITIAL_FILTERS = {
  branch: "all",
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
  const { showConfirmToast } = useConfirmToast();
  const { authUser } = useAuth();
  
  // 🚀 GATEKEEPER CONTEXT (From AdminLayout)
  const context = useOutletContext() || {}; 
  const branchId = context.branchId || authUser?.branch?._id || authUser?.branch; 

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudentForQr, setSelectedStudentForQr] = useState(null);
  const [selectedStudentForComment, setSelectedStudentForComment] = useState(null);
  const [paymentData, setPaymentData] = useState(null); 
  
  const limit = 20;

  // 🚀 PBAC DYNAMIC SECURITY CHECKS
  const permissions = authUser?.role?.permissions || authUser?.permissions || [];
  const roleName = (typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name || "").toLowerCase();
  
  const isMaster = roleName === "superadmin" || permissions.includes("all_access");
  const canAddStudent = isMaster || permissions.includes("add_student");

  // Determine which branch ID to use for fetching dropdowns
  const effectiveBranchId = useMemo(() => {
    if (isMaster) return filters.branch === "all" ? null : filters.branch; 
    return branchId;
  }, [isMaster, filters.branch, branchId]);

  const { data: batchesRes } = useBatches(effectiveBranchId ? { branch: effectiveBranchId } : {});
  const { data: coursesRes } = useActiveCourses();
  const { data: branchesRes } = useBranches({}, { enabled: isMaster }); 
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };
    
    // 🚀 PBAC GATE: Branch Isolation
    if (!isMaster) {
      activeFilters.branch = branchId; 
    } else if (activeFilters.branch === "all") {
      delete activeFilters.branch;
    }

    if (debouncedSearch) activeFilters.search = debouncedSearch;
    
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key] === "all" || activeFilters[key] === "") delete activeFilters[key];
    });
    
    return activeFilters;
  }, [filters, debouncedSearch, branchId, isMaster]);

  // 🚀 FETCH STUDENTS (Only if branch is ready for non-admins)
  const { data, isLoading, error, refetch, isRefetching } = useStudents(
    page, 
    limit, 
    queryFilters,
    { enabled: isMaster ? true : !!branchId } // Prevent premature fetching
  );

  const combinedFilterOptions = useMemo(() => ({
    batches: batchesRes?.data || [],
    courses: coursesRes?.data || [],
    branches: isMaster ? branchesRes?.data || [] : []
  }), [batchesRes, coursesRes, branchesRes, isMaster]);

  const deleteStudentMutation = useDeleteStudent();
  const toggleStatusMutation = useToggleStudentStatus();

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  // Prevent UI rendering crash before branch logic resolves
  if (!isMaster && !branchId) return <div className="p-6"><TableSkeleton rows={8} /></div>;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader 
        title="Student Directory" 
        subtitle={`Viewing ${isMaster ? 'All Campuses' : 'Your Campus'} Records`} 
        onAdd={canAddStudent ? () => navigate("/admin/add-student") : undefined} 
        addText={canAddStudent ? "Add Student" : undefined} 
      />

      <div className="mb-6">
        <StudentFilters 
          onFilterChange={setFilters} 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          filterOptions={combinedFilterOptions} 
          initialFilters={INITIAL_FILTERS} 
          isLoading={isLoading} 
        />
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        {isLoading ? <TableSkeleton rows={8} /> : (
          <StudentsTable
            students={data?.data || []} 
            currentUser={authUser} 
            pagination={data?.pagination}
            onDelete={(id, name) => showConfirmToast({
              type: "delete", title: "Delete", message: `Delete ${name}?`,
              onConfirm: () => deleteStudentMutation.mutate(id)
            })} 
            onToggleStatus={(id) => toggleStatusMutation.mutate(id)}
            onGenerateQR={setSelectedStudentForQr} 
            onAddComment={setSelectedStudentForComment}
            onPay={(student) => setPaymentData({ studentId: student._id, studentName: student.student_name })}
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

      {selectedStudentForQr && <QRCodeModal student={selectedStudentForQr} onClose={() => setSelectedStudentForQr(null)} />}
      {selectedStudentForComment && <CommentModal student={selectedStudentForComment} onClose={() => setSelectedStudentForComment(null)} />}
      {paymentData && (
        <CollectPaymentModal isOpen={!!paymentData} onClose={() => setPaymentData(null)} studentId={paymentData.studentId} studentName={paymentData.studentName} />
      )}
    </div>
  );
};

export default AllStudents;