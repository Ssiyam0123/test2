import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowRight, Percent, AlertCircle, CheckCircle2 } from "lucide-react";

// Hooks
import { useCampusFees } from "../../hooks/useFinance";
import { useBranches } from "../../hooks/useBranches"; 
import useAuth from "../../store/useAuth";
import { PERMISSIONS } from "../../config/permissionConfig";

// Components
import PageHeader from "../../components/common/PageHeader";
import BranchDropdown from "../../components/common/BranchDropdown";
import DataFilters from "../../components/common/DataFilters";
import Avatar from "../../components/common/Avatar";
import Pagination from "../../components/common/Pagination";
import TableSkeleton from "../../components/common/TableSkeleton";
import PermissionGuard from "../../components/common/PermissionGuard";
import DataErrorState from "../../components/common/DataErrorState";

const INITIAL_FILTERS = {
  status: "all",
};

export default function CampusFinanceList() {
  const navigate = useNavigate();
  const { authUser, isMaster } = useAuth();
  
  const context = useOutletContext() || {};
  const branchId = context.branchId || authUser?.branch?._id || authUser?.branch;
  const isSuper = isMaster();

  // 🚀 States
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [superAdminBranchFilter, setSuperAdminBranchFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10; // Per page rows

  // 🚀 Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🚀 Reset Page on Filter Change
  useEffect(() => {
    setPage(1);
  }, [filters, debouncedSearch, superAdminBranchFilter]);

  // 🚀 Effective Branch Resolution
  const effectiveBranchId = useMemo(() => {
    if (isSuper) return superAdminBranchFilter === "all" ? null : superAdminBranchFilter;
    return branchId;
  }, [isSuper, superAdminBranchFilter, branchId]);

  const { data: branches = [] } = useBranches({}, { enabled: isSuper });

  // 🚀 Build Query Config
  const queryFilters = useMemo(() => {
    const activeFilters = { ...filters };
    if (effectiveBranchId) activeFilters.branch = effectiveBranchId;
    if (debouncedSearch) activeFilters.search = debouncedSearch;
    
    // Remove "all" defaults
    Object.keys(activeFilters).forEach((key) => {
      if (activeFilters[key] === "all" || activeFilters[key] === "") {
        delete activeFilters[key];
      }
    });
    return activeFilters;
  }, [filters, debouncedSearch, effectiveBranchId]);

  // 🚀 Fetch Data
  const { 
    data: fees = [], 
    isLoading, 
    error, 
    refetch, 
    isRefetching 
  } = useCampusFees(queryFilters);

  // 🚀 Client-Side Pagination Logic
  const totalRecords = fees?.length || 0;
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const paginatedFees = useMemo(() => {
    if (!fees) return [];
    const start = (page - 1) * limit;
    return fees.slice(start, start + limit);
  }, [fees, page, limit]);

  // 🚀 Filter Configuration for DataFilters
  const searchConfig = {
    value: searchTerm,
    onChange: setSearchTerm,
    placeholder: "Search student by name, ID, or phone...",
    showButton: false,
  };

  const filterConfig = [
    {
      key: "status",
      label: "Payment Status",
      type: "select",
      color: "blue",
      options: [
        { value: "all", label: "All Status" },
        { value: "Paid", label: "Fully Paid" },
        { value: "Partial", label: "Partial Due" },
        { value: "Unpaid", label: "Unpaid" },
      ],
    }
  ];

  if (error) return <DataErrorState error={error} onRetry={refetch} isRetrying={isRefetching} />;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen font-sans animate-in fade-in duration-500">
      
      {/* 🟢 UNIFIED PAGE HEADER */}
      <PageHeader
        title="Campus Finance Ledger"
        subtitle="Overview of student payments and dues across the campus."
      />

      {/* 🟢 FILTERS SECTION */}
      <div className="mb-6 space-y-4">
        {/* Branch Dropdown for Superadmin */}
        <PermissionGuard requiredPermission={PERMISSIONS.VIEW_BRANCHES}>
          {isSuper && (
            <div className="flex justify-end">
              <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-slate-200">
                <BranchDropdown
                  isMaster={isSuper}
                  branches={branches}
                  value={superAdminBranchFilter}
                  onChange={setSuperAdminBranchFilter}
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          )}
        </PermissionGuard>

        {/* Unified Data Filters */}
        <DataFilters
          searchConfig={searchConfig}
          filterConfig={filterConfig}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => {
            setSearchTerm("");
            setFilters(INITIAL_FILTERS);
            setPage(1);
          }}
          isLoading={isLoading || isRefetching}
        />
      </div>

      {/* 🟢 DATA TABLE & PAGINATION */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount & Discount</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[300px]">Financial Flow</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedFees.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-slate-400 font-bold">No financial records found.</td>
                  </tr>
                ) : (
                  paginatedFees.map((fee) => {
                    const dueAmount = fee.net_payable - fee.paid_amount;
                    const paidPercentage = fee.net_payable > 0 ? (fee.paid_amount / fee.net_payable) * 100 : 0;
                    const isFullyPaid = fee.status === "Paid" || dueAmount <= 0;

                    return (
                      <tr key={fee._id} className="hover:bg-slate-50/50 transition-colors group">
                        
                        {/* 1. STUDENT INFO */}
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <Avatar 
                              src={fee.student?.photo_url} 
                              alt={fee.student?.student_name} 
                              fallbackText={fee.student?.student_name} 
                              sizeClass="w-12 h-12 rounded-xl" 
                            />
                            <div>
                              <h4 className="text-sm font-black text-slate-800">{fee.student?.student_name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{fee.student?.student_id}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded">
                                {fee.course?.course_name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. AMOUNT & DISCOUNT */}
                        <td className="p-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase w-12">Total:</span>
                              <span className="text-sm font-bold text-slate-700">৳{fee.total_amount.toLocaleString()}</span>
                            </div>
                            {fee.discount > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-rose-400 uppercase w-12 flex items-center gap-1"><Percent size={10}/> Dist:</span>
                                <span className="text-xs font-black text-rose-500">- ৳{fee.discount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 pt-1 mt-1 border-t border-slate-100">
                              <span className="text-[10px] font-black text-slate-600 uppercase w-12">Net:</span>
                              <span className="text-sm font-black text-slate-900">৳{fee.net_payable.toLocaleString()}</span>
                            </div>
                          </div>
                        </td>

                        {/* 3. FINANCIAL FLOW */}
                        <td className="p-5">
                          <div className="w-full space-y-2">
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                              <span className="text-emerald-500">Paid: ৳{fee.paid_amount.toLocaleString()}</span>
                              {dueAmount > 0 ? (
                                <span className="text-rose-500">Due: ৳{dueAmount.toLocaleString()}</span>
                              ) : (
                                <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Cleared</span>
                              )}
                            </div>
                            
                            <div className="h-2 w-full bg-rose-100 rounded-full overflow-hidden flex shadow-inner">
                              <div 
                                className={`h-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-teal-500'} transition-all duration-1000 ease-out`}
                                style={{ width: `${paidPercentage}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase">{paidPercentage.toFixed(0)}% Completed</span>
                              {fee.status === "Partial" && <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase"><AlertCircle size={10}/> Active</span>}
                            </div>
                          </div>
                        </td>

                        {/* 4. ACTION BUTTON */}
                        <td className="p-5 text-center">
                          <button
                            onClick={() => navigate(`/admin/student-finance/${fee.student?._id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 group/btn"
                          >
                            Ledger <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* 🟢 PAGINATION COMPONENT */}
        {!isLoading && totalRecords > 0 && (
          <Pagination
            currentLength={paginatedFees.length}
            total={totalRecords}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            searchTerm={debouncedSearch}
            itemName="fee records"
          />
        )}
      </div>
    </div>
  );
}