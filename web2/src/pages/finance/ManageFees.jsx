import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useCampusFees } from "../../hooks/useFinance";
import { useBranches } from "../../hooks/useBranches";
import useAuth from "../../store/useAuth";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import TableSkeleton from "../../components/common/TableSkeleton";
import DataErrorState from "../../components/common/DataErrorState";
import CollectPaymentModal from "../../components/modal/CollectPaymentModal";
import { Wallet, Search, Filter, CircleDollarSign } from "lucide-react";

const ManageFees = () => {
  const { authUser } = useAuth();
  const { branchId } = useOutletContext() || {};
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [paymentModal, setPaymentModal] = useState(null);

  // Filter Logic
  const filters = useMemo(() => {
    const f = { status: statusFilter, search: searchTerm };
    if (authUser?.role === "superadmin") {
        if (branchFilter !== "all") f.branch = branchFilter;
    } else {
        f.branch = branchId;
    }
    return f;
  }, [searchTerm, statusFilter, branchFilter, branchId, authUser]);

  const { data, isLoading, error, refetch } = useCampusFees(filters);
  const { data: branches } = useBranches();

  const columns = [
    {
      header: "Student",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
             {row.student?.photo_url ? (
               <img src={`${import.meta.env.VITE_IMAGE_URL}${row.student.photo_url}`} className="w-full h-full object-cover" alt="" />
             ) : row.student?.student_name?.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-700 leading-tight">{row.student?.student_name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.student?.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Course",
      accessor: (row) => <span className="text-sm font-bold text-slate-600">{row.course?.course_name}</span>
    },
    {
      header: "Financial Summary",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
             <span>Net Payable</span>
             <span className="text-slate-700">৳{row.net_payable.toLocaleString()}</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-teal-500 transition-all duration-500" 
               style={{ width: `${(row.paid_amount / row.net_payable) * 100}%` }}
             />
          </div>
        </div>
      )
    },
    {
      header: "Paid",
      accessor: (row) => <span className="text-sm font-black text-emerald-600">৳{row.paid_amount.toLocaleString()}</span>
    },
    {
      header: "Due",
      accessor: (row) => (
        <span className={`text-sm font-black ${row.net_payable - row.paid_amount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
          ৳{(row.net_payable - row.paid_amount).toLocaleString()}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          row.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
          row.status === 'Partial' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  if (error) return <DataErrorState error={error} onRetry={refetch} />;

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen">
      <PageHeader 
        title="Fee Management" 
        subtitle="Track student billing and collections." 
        icon={<CircleDollarSign className="text-teal-600" />}
      />

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search Student Name or ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
           />
        </div>

        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer border-none"
        >
          <option value="all">All Status</option>
          <option value="Paid">Fully Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>

        {authUser?.role === "superadmin" && (
           <select 
             value={branchFilter}
             onChange={(e) => setBranchFilter(e.target.value)}
             className="px-4 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 outline-none cursor-pointer border-none"
           >
             <option value="all">All Branches</option>
             {branches?.data?.map(b => <option key={b._id} value={b._id}>{b.branch_name}</option>)}
           </select>
        )}
      </div>

      {isLoading ? <TableSkeleton rows={10} /> : (
        <DataTable 
          columns={columns} 
          data={data || []}
          onRowClick={(row) => setPaymentModal({
            feeId: row._id,
            dueAmount: row.net_payable - row.paid_amount,
            studentName: row.student?.student_name
          })}
          actions={(row) => (
            <button 
              onClick={() => setPaymentModal({
                feeId: row._id,
                dueAmount: row.net_payable - row.paid_amount,
                studentName: row.student?.student_name
              })}
              disabled={row.status === 'Paid'}
              className="p-2.5 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all disabled:opacity-30"
            >
              <Wallet size={18} />
            </button>
          )}
        />
      )}

      {paymentModal && (
        <CollectPaymentModal 
          isOpen={!!paymentModal}
          onClose={() => setPaymentModal(null)}
          feeId={paymentModal.feeId}
          dueAmount={paymentModal.dueAmount}
          studentName={paymentModal.studentName}
        />
      )}
    </div>
  );
};

export default ManageFees;