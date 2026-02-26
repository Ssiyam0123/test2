import React, { useMemo } from "react";
import { ReceiptText, ArrowDownRight, Wallet, Loader2 } from "lucide-react";
import { useExpenses } from "../../hooks/useExpenses"; 

export default function CostSummaryWidget({ entityId, entityType }) {
  // 1. Format the filter for the hook based on the props passed from the parent page
  const filters = useMemo(() => {
    if (entityType === "branch") return { branchId: entityId };
    if (entityType === "batch") return { batchId: entityId };
    if (entityType === "class") return { classId: entityId };
    return {};
  }, [entityId, entityType]);

  // 2. Fetch the live data!
  const { data: response, isLoading, isError } = useExpenses(filters);
  const costs = response?.data || [];

  // 3. Crunch the numbers dynamically
  const totalCost = useMemo(() => {
    return costs.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  }, [costs]);

  const recentCosts = useMemo(() => {
    // Already sorted by the backend, but we just grab the top 4 for the UI
    return costs.slice(0, 4);
  }, [costs]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex flex-col h-full items-center justify-center min-h-[250px]">
        <Loader2 className="animate-spin text-teal-500 mb-2" size={24} />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Ledger...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-[2rem] shadow-sm border border-rose-100 p-6 flex flex-col h-full items-center justify-center min-h-[250px]">
        <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Failed to load costs</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex flex-col h-full min-h-[250px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Cost Overview</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {entityType === 'branch' ? 'Campus' : entityType === 'batch' ? 'Batch' : 'Class'} Ledger
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-black text-slate-800 tracking-tighter">
          ৳{totalCost.toLocaleString()}
        </span>
      </div>

      <div className="flex-1">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
          Recent Transactions
        </h4>
        
        {recentCosts.length > 0 ? (
          <div className="space-y-3">
            {recentCosts.map((cost) => (
              <div key={cost._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ArrowDownRight size={16} className="text-rose-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate pr-2">{cost.title}</p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(cost.date_incurred).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {/* Optional: Show which class this was for if looking at the Branch or Batch view */}
                      {cost.class_content?.class_number && ` • Class ${cost.class_content.class_number}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-800 shrink-0">৳{cost.amount?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 opacity-50">
            <ReceiptText className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-500">No costs recorded.</span>
          </div>
        )}
      </div>
    </div>
  );
}