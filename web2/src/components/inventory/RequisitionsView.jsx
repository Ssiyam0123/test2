import React from "react";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { usePendingRequisitions, useFulfillRequisition, useRejectRequisition } from "../../hooks/useRequisitions";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader";

export default function RequisitionsView({ branchId }) {
  const { hasPermission } = useAuth();
  const { data: res, isLoading } = usePendingRequisitions(branchId);
  const fulfillMutation = useFulfillRequisition(branchId);
  const rejectMutation = useRejectRequisition(branchId);

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  const pending = res?.data?.filter(r => r.status === "pending") || [];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 bg-amber-50/50 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2 text-amber-700">
          <ClipboardList size={20} />
          <h2 className="text-sm font-black uppercase tracking-widest">Pending Requests ({pending.length})</h2>
        </div>
      </div>
      
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {pending.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">All caught up!</p>
          </div>
        ) : (
          pending.map(req => (
            <div 
              key={req._id} 
              className="group p-5 border border-slate-200 rounded-2xl bg-white hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-default"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-800 text-sm">{req.class_content?.topic || "Custom Request"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Requested By: <span className="text-indigo-600">{req.requested_by?.full_name}</span></p>
                </div>
                
                {hasPermission("approve_requisitions") && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => rejectMutation.mutate(req._id)}
                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors"
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                    {/* 🚀 No cost field, just direct approval with 0 cost */}
                    <button 
                      onClick={() => fulfillMutation.mutate({ reqId: req._id, actual_cost: 0 })}
                      disabled={fulfillMutation.isPending}
                      className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all active:scale-95"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>

              {/* 🚀 HIDDEN DETAILS: Only shows on hover */}
              <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[500px] group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 ease-in-out">
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Requested Ingredients:</p>
                  <div className="flex flex-wrap gap-2">
                    {req.items?.map((item, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 capitalize shadow-sm">
                        {item.item_name} <span className="text-amber-600 ml-1 font-black">x{item.quantity} {item.unit}</span>
                      </span>
                    ))}
                    {(!req.items || req.items.length === 0) && (
                      <span className="text-xs text-slate-400 italic">No items specified.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}