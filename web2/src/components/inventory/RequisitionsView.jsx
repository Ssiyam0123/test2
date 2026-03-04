import React, { useState } from "react";
import { ClipboardList, CheckCircle2, XCircle } from "lucide-react";
import { usePendingRequisitions, useFulfillRequisition, useRejectRequisition } from "../../hooks/useRequisitions";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader";

export default function RequisitionsView({ branchId }) {
  const { hasPermission } = useAuth();
  const { data: res, isLoading } = usePendingRequisitions(branchId);
  const fulfillMutation = useFulfillRequisition(branchId);
  const [costs, setCosts] = useState({});

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  const pending = res?.data?.filter(r => r.status === "pending") || [];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
      <div className="p-6 bg-amber-50/50 flex items-center gap-2 text-amber-700 border-b border-slate-100">
        <ClipboardList size={20} />
        <h2 className="text-sm font-black uppercase tracking-widest">Pending Requests ({pending.length})</h2>
      </div>
      <div className="p-6 space-y-4">
        {pending.map(req => (
          <div key={req._id} className="p-5 border rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-black text-slate-800">{req.class_content?.topic || "Custom Request"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">By: {req.requested_by?.full_name}</p>
            </div>
            {hasPermission("approve_requisitions") && (
              <div className="flex gap-2">
                <input 
                  type="number" placeholder="Actual Cost" 
                  className="w-24 p-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  onChange={(e) => setCosts({...costs, [req._id]: e.target.value})}
                />
                <button 
                  onClick={() => fulfillMutation.mutate({reqId: req._id, actual_cost: costs[req._id]})}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                >Approve</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}