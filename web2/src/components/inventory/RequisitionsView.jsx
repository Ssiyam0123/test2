import React, { useMemo } from "react";
import { ClipboardList, CheckCircle2, ShoppingBag } from "lucide-react";
import { useAllRequisitions } from "../../hooks/useRequisitions"; 
import Loader from "../../components/Loader";

export default function RequisitionsView({ branchId }) { 
  const { data: res, isLoading } = useAllRequisitions(branchId);
  console.log(res)
  // 🚀 EXTENDED EXTRACTION: Added a few more common backend patterns
  const reqList = useMemo(() => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.requisitions)) return res.requisitions;
    if (Array.isArray(res?.data?.requisitions)) return res.data.requisitions;
    return [];
  }, [res]);

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  const pending = reqList.filter(r => r.status?.toLowerCase() === "pending");

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      
      {/* 🛑 DEBUG BOX: এটা স্ক্রিনে দেখাবে ব্যাকএন্ড কী পাঠাচ্ছে */}
      <div className="p-4 bg-slate-900 text-green-400 text-xs overflow-auto max-h-60 border-b-4 border-red-500">
        <p className="text-white font-bold mb-2">👇 Bhai, ei black box er lekha gula amake copy kore de:</p>
        <pre>{JSON.stringify(res, null, 2)}</pre>
      </div>

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
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800">{req.class_content?.topic || "Custom Request"}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">By: {req.requested_by?.full_name || req.requested_by?.username || "Admin / Instructor"}</p>
                </div>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-lg uppercase">Pending</span>
              </div>

              <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-[500px] group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 ease-in-out">
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <ShoppingBag size={12} /> Requested Ingredients:
                  </p>
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