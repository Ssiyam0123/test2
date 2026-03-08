import React, { useState, useEffect, useMemo } from "react";
import {
  useClassRequisition,
  useSubmitRequisition,
  useApproveRequisition,
  useRejectRequisition,
} from "../../hooks/useRequisitions";
import { useInventory } from "../../hooks/useInventory"; 
import { X, Plus, Trash2, CheckCircle, XCircle, ShoppingCart, Loader2, RefreshCw } from "lucide-react";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader"; 
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function ClassRequisitionModal({ isOpen, onClose, classData, batchData }) {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("approve_requisitions");

  // Safe API Data Extraction
  const { data: reqRes, isLoading: reqLoading } = useClassRequisition(classData?._id);
  const existingReq = reqRes?.data || reqRes;

  const { data: invRes, isLoading: invLoading } = useInventory(batchData?.branch?._id || batchData?.branch);
  const inventoryList = useMemo(() => {
    return Array.isArray(invRes?.data) ? invRes.data : Array.isArray(invRes) ? invRes : [];
  }, [invRes]);
  
  // Hooks
  const submitMutation = useSubmitRequisition();
  const approveMutation = useApproveRequisition(); 
  const rejectMutation = useRejectRequisition();   

  // Local States
  const [items, setItems] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [adminNote, setAdminNote] = useState("");

  // Sync state with existing requisition
  useEffect(() => {
    if (existingReq && existingReq._id) {
      setItems(existingReq.items || []);
      setEstimatedCost(existingReq.total_estimated_cost || 0);
      setAdminNote(existingReq.admin_note || "");
    } else {
      setItems([{ inventory_item: "", item_name: "", quantity: 1, unit: "pcs", is_custom: false }]);
    }
  }, [existingReq, isOpen]);

  // 🚀 SMART UI FLAGS (কখন এডিট করা যাবে আর কখন সাবমিট করা যাবে)
  const isRejected = existingReq?.status === "rejected";
  const isPending = existingReq?.status === "pending";
  
  // যদি রিকুইজিশন না থাকে, অথবা রিজেক্টেড হয়, অথবা পেন্ডিং অবস্থায় অ্যাডমিন দেখে, তবে এডিট করা যাবে।
  const canEditItems = !existingReq || isRejected || (isPending && canApprove);
  
  // নতুন সেন্ড বা রিজেক্ট হওয়ার পর রিসেন্ড করার পারমিশন
  const canSubmit = !existingReq || isRejected;

  if (!isOpen) return null;

  // --- Actions ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.item_name.trim() !== "" && Number(i.quantity) > 0);
    if (validItems.length === 0) return Swal.fire("Error", "Add at least one valid item", "error");

    const payload = {
      class_content: classData._id, 
      batch: batchData._id,         
      branch: batchData?.branch?._id || batchData?.branch,
      items: validItems.map(item => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        is_custom: item.is_custom,
        ...( (!item.is_custom && item.inventory_item) && { inventory_item: item.inventory_item } )
      })),
    };

    submitMutation.mutate(payload, { 
      onSuccess: () => {
        toast.success(isRejected ? "Requisition Resubmitted!" : "Requisition submitted to Admin!");
        onClose();
      } 
    });
  };

  const handleApprove = () => {
    if (!existingReq?._id) return;
    approveMutation.mutate({ 
      id: existingReq._id, 
      payload: { 
        items, 
        total_estimated_cost: Number(estimatedCost),
        admin_note: adminNote 
      } 
    }, { 
      onSuccess: () => {
        toast.success("Approved & Stock Deducted!");
        onClose();
      } 
    });
  };

  const handleReject = () => {
    if (!existingReq?._id) return;
    rejectMutation.mutate({ 
      id: existingReq._id, 
      admin_note: adminNote || "Rejected by admin" 
    }, { 
      onSuccess: () => {
        toast.error("Requisition Rejected.");
        onClose();
      } 
    });
  };

  const isLoading = reqLoading || invLoading;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Class Requisition</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded uppercase tracking-widest">{batchData?.batch_name}</span>
               <p className="text-xs text-slate-400 font-bold truncate max-w-[200px] sm:max-w-xs">Topic: {classData?.topic}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all shadow-sm">
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#f8fafc]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
               <Loader2 className="animate-spin text-teal-500" size={32} />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : (
            <>
              {existingReq && existingReq._id && (
                <div className={`p-5 rounded-2xl mb-8 font-black flex items-center gap-3 border-2 shadow-sm ${
                  existingReq.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                  existingReq.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                }`}>
                  {existingReq.status === "approved" ? <CheckCircle size={22} /> : existingReq.status === "rejected" ? <XCircle size={22} /> : <div className="w-3 h-3 rounded-full bg-amber-500" />}
                  <span className="uppercase tracking-widest text-sm">Status: {existingReq.status}</span>
                  {existingReq.admin_note && <span className="ml-auto text-[11px] font-bold opacity-70 italic font-sans truncate max-w-[150px] sm:max-w-[300px]">" {existingReq.admin_note} "</span>}
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ingredients / Materials</p>
                
                {items.map((item, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-200 transition-colors group">
                    
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Item Selection</label>
                      {/* 🚀 FIXED: Only editable if canEditItems is true */}
                      {canEditItems ? (
                        <select
                          value={item.is_custom ? "custom" : item.inventory_item || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newItems = [...items];
                            if (val === "custom") {
                              newItems[index] = { ...item, is_custom: true, inventory_item: "", item_name: "", unit: "pcs" };
                            } else {
                              const selectedInv = inventoryList.find((i) => i._id === val);
                              newItems[index] = { ...item, is_custom: false, inventory_item: val, item_name: selectedInv?.item_name || "", unit: selectedInv?.unit || "pcs" };
                            }
                            setItems(newItems);
                          }}
                          className="w-full p-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 font-bold text-slate-700 bg-slate-50 transition-all"
                        >
                          <option value="" disabled>Search Inventory...</option>
                          <optgroup label="Current Stock">
                            {inventoryList.map((inv) => (
                              <option key={inv._id} value={inv._id}>{inv.item_name} ({inv.quantity_in_stock} {inv.unit} left)</option>
                            ))}
                          </optgroup>
                          <option value="custom">➕ Add Custom Item (Market Purchase)</option>
                        </select>
                      ) : (
                        <div className="font-bold text-slate-800 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          {item.item_name} {item.is_custom && <span className="ml-2 text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">Market</span>}
                        </div>
                      )}
                      
                      {item.is_custom && canEditItems && (
                        <input
                          type="text" placeholder="Type custom item name..."
                          value={item.item_name}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].item_name = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full mt-2 p-3 text-sm border-2 border-indigo-100 rounded-xl outline-none focus:border-indigo-500 font-bold animate-in slide-in-from-top-1"
                        />
                      )}
                    </div>

                    <div className="w-24 shrink-0">
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Quantity</label>
                      <input
                        type="number" min="0.1" step="any" value={item.quantity}
                        disabled={!canEditItems} // 🚀 FIXED
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = Number(e.target.value);
                          setItems(newItems);
                        }}
                        className="w-full p-3 text-sm border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 font-black text-center bg-slate-50 disabled:opacity-60 transition-all"
                      />
                    </div>

                    <div className="w-20 shrink-0">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1 text-center">Unit</label>
                       <div className="w-full p-3 text-sm border-2 border-slate-100 rounded-xl font-black text-center text-slate-500 bg-slate-50 uppercase tracking-widest">
                          {item.unit}
                       </div>
                    </div>

                    {canSubmit && (
                      <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="p-3.5 mb-0.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canSubmit && (
                <button
                  onClick={() => setItems([...items, { inventory_item: "", item_name: "", quantity: 1, unit: "pcs", is_custom: false }])}
                  className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50 px-6 py-3.5 rounded-2xl border-2 border-dashed border-teal-200 hover:border-teal-400 transition-all w-full active:scale-[0.99]"
                >
                  <Plus size={16} strokeWidth={3} /> Add Another Item
                </button>
              )}

              {/* Admin Controls Section */}
              {existingReq && isPending && canApprove && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Estimated Market Cost (৳)</label>
                      <input 
                        type="number" min="0" step="any"
                        value={estimatedCost} 
                        onChange={(e) => setEstimatedCost(e.target.value)} 
                        placeholder="0.00"
                        className="w-full p-4 border-2 border-slate-200 rounded-2xl font-black text-teal-700 outline-none focus:border-teal-500 text-lg shadow-inner bg-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Internal Note</label>
                      <textarea 
                        rows="1"
                        placeholder="Add a comment for the instructor..." 
                        value={adminNote} 
                        onChange={(e) => setAdminNote(e.target.value)} 
                        className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold outline-none focus:border-teal-500 shadow-inner resize-none bg-white text-slate-700" 
                      />
                    </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">Dismiss</button>
          
          {/* 🚀 FIXED: Dynamic Button based on states */}
          {canSubmit ? (
            <button 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending || items.length === 0} 
              className={`px-8 py-3.5 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 ${isRejected ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-slate-900 hover:bg-indigo-600 shadow-slate-200'}`}
            >
              {submitMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : isRejected ? <RefreshCw size={16} /> : <ShoppingCart size={16} />}
              {isRejected ? "Resubmit Request" : "Send Requisition"}
            </button>
          ) : isPending && canApprove ? (
            <>
              <button 
                onClick={handleReject} 
                disabled={rejectMutation.isPending} 
                className="px-8 py-3.5 bg-white border-2 border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50"
              >
                Reject Request
              </button>
              <button 
                onClick={handleApprove} 
                disabled={approveMutation.isPending} 
                className="px-8 py-3.5 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {approveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                Approve & Release Stock
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}