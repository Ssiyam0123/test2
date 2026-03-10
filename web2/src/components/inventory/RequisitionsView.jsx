import React, { useState } from "react";
import { ClipboardList, CheckCircle2, ShoppingBag, Check, X, Loader2 } from "lucide-react";
import { useAllRequisitions, useApproveRequisition, useRejectRequisition } from "../../hooks/useRequisitions"; 
import Loader from "../../components/Loader";
import { toast } from "react-hot-toast";
import useAuth from "../../store/useAuth";
import { PERMISSIONS } from "../../config/permissionConfig";
import { confirmDelete } from "../../utils/swalUtils"; // 🚀 Reusable Swal Import

export default function RequisitionsView({ branchId }) { 
  const { hasPermission } = useAuth();
  const { data: requisitions = [], isLoading } = useAllRequisitions(branchId);
  
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();

  const [processingId, setProcessingId] = useState(null);

  // 🚀 গ্র্যানুলার পারমিশন ফ্ল্যাগ
  const canTakeAction = hasPermission(PERMISSIONS.INVENTORY_REQUISITION_ACTION);

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  const pending = requisitions.filter(r => r.status?.toLowerCase() === "pending");

  const handleApprove = (id) => {
    // অ্যাকশন কনফার্মেশনের জন্য Swal ইউটিলিটি ব্যবহার (confirmDelete কে কাস্টমাইজ করে)
    confirmDelete({
      title: "Approve Requisition?",
      text: "This will issue the items and update current stock levels.",
      confirmText: "Yes, Approve & Issue",
      onConfirm: async () => {
        setProcessingId(id);
        try {
          await approveMutation.mutateAsync({ id, payload: {} }); 
          toast.success("Requisition Approved & Stock Updated!");
        } catch (err) {
          toast.error(err.response?.data?.message || "Approval Failed");
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleReject = async (id) => {
    const note = window.prompt("Enter rejection reason (optional):");
    if (note === null) return; 

    setProcessingId(id);
    try {
      await rejectMutation.mutateAsync({ id, admin_note: note });
      toast.success("Requisition Rejected");
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection Failed");
    } finally {
      setProcessingId(null);
    }
  };

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
            <div key={req._id} className="group p-5 border border-slate-200 rounded-2xl bg-white hover:border-amber-300 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{req.class_content?.topic || "Custom Request"}</h4>
                  <p className="text-[10px] font-black text-indigo-600 mt-1 uppercase tracking-tighter">
                    {req.batch?.batch_name || "N/A"} • Class {req.class_content?.class_number}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    By: {req.requested_by?.full_name || "Instructor"}
                  </p>
                </div>

                {/* 🚀 অ্যাকশন বাটন: পারমিশন প্রটেক্টড */}
                {canTakeAction && (
                  <div className="flex gap-2">
                    <button 
                      disabled={processingId === req._id}
                      onClick={() => handleReject(req._id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                      title="Reject Request"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                    <button 
                      disabled={processingId === req._id}
                      onClick={() => handleApprove(req._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                    >
                      {processingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                      <span className="text-xs font-black uppercase tracking-widest">Approve</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <ShoppingBag size={12} /> Items to Issue:
                </p>
                <div className="flex flex-wrap gap-2">
                  {req.items?.map((item, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 capitalize">
                      {item.item_name} <span className="text-amber-600 ml-1 font-black font-mono">x{item.quantity} {item.unit}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}