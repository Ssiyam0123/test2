import React, { useState, useEffect, useMemo } from "react";
import {
  useClassRequisition,
  useSubmitRequisition,
  useReviewRequisition,
} from "../../hooks/useRequisitions";
import { useInventory } from "../../hooks/useInventory"; 
import { X, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import useAuth from "../../store/useAuth";
import Loader from "../Loader";
import Swal from "sweetalert2";

export default function ClassRequisitionModal({
  isOpen,
  onClose,
  classData,
  batchData,
}) {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission("approve_requisitions");

  const { data: reqRes, isLoading } = useClassRequisition(classData?._id);
  const existingReq = reqRes?.data;

  // Fetch Inventory
  const { data: invRes } = useInventory(batchData?.branch?._id || batchData?.branch);
  
  // 🚀 FIXED: Safely extract inventory items from standard API response
  const inventoryList = useMemo(() => {
    if (Array.isArray(invRes?.data)) return invRes.data;
    if (Array.isArray(invRes?.data?.data)) return invRes.data.data;
    if (Array.isArray(invRes)) return invRes;
    return [];
  }, [invRes]);

  const submitMutation = useSubmitRequisition();
  const { approve, reject } = useReviewRequisition(existingReq?._id, classData?._id);

  const [items, setItems] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (existingReq) {
      setItems(existingReq.items);
      setEstimatedCost(existingReq.total_estimated_cost || 0);
    } else {
      setItems([{ inventory_item: "", item_name: "", quantity: 1, unit: "pcs", is_custom: false }]);
    }
  }, [existingReq, isOpen]);

  if (!isOpen) return null;

const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter((i) => i.item_name.trim() !== "" && i.quantity > 0);
    if (validItems.length === 0) return Swal.fire("Error", "Add at least one valid item", "error");

    // Strictly map the items
    const sanitizedItems = validItems.map(item => {
      const payload = {
        item_name: item.item_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        is_custom: item.is_custom // Keep this if needed
      };
      
      // Only add inventory_item if it exists AND is not custom.
      if (!item.is_custom && item.inventory_item) {
        payload.inventory_item = item.inventory_item;
      }
      return payload;
    });

    // 🚀 FIXED: Added the 'branch' field back to satisfy Mongoose requirements
    submitMutation.mutate({
      class_content: classData._id, 
      batch: batchData._id,         
      branch: batchData?.branch?._id || batchData?.branch, // 👈 এটা এখন মাস্ট পাঠাতে হবে
      items: sanitizedItems,        
    });
  };

  const handleApprove = () => {
    approve.mutate({ items, total_estimated_cost: estimatedCost, admin_note: adminNote });
  };

  const handleReject = () => reject.mutate(adminNote || "Rejected by admin");

  const isPending = existingReq?.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-800 uppercase">Class Requisition</h2>
            <p className="text-xs text-gray-500 font-bold">{classData?.topic}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {existingReq && (
                <div className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-2 ${
                  existingReq.status === "approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                  existingReq.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {existingReq.status === "approved" ? <CheckCircle size={20} /> : existingReq.status === "rejected" ? <XCircle size={20} /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                  Status: {existingReq.status.toUpperCase()}
                  {existingReq.admin_note && <span className="ml-auto text-xs opacity-80">Note: {existingReq.admin_note}</span>}
                </div>
              )}

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] font-black uppercase text-gray-400">Item Name</label>
                      {!existingReq || (isPending && canApprove) ? (
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
                          className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-500 font-bold text-gray-700"
                        >
                          <option value="" disabled>Select Item</option>
                          <optgroup label="Inventory Stock">
                            {inventoryList.map((inv) => (
                              <option key={inv._id} value={inv._id}>
                                {inv.item_name} (Stock: {inv.quantity_in_stock} {inv.unit})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Other">
                            <option value="custom">🛒 Custom / Shopping List Item</option>
                          </optgroup>
                        </select>
                      ) : (
                        <div className="font-bold text-gray-800 mt-2">
                          {item.item_name} {item.is_custom && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md ml-2">Custom</span>}
                        </div>
                      )}
                      
                      {item.is_custom && (!existingReq || (isPending && canApprove)) && (
                        <input
                          type="text"
                          placeholder="Type custom item name..."
                          value={item.item_name}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].item_name = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-500"
                        />
                      )}
                    </div>

                    <div className="w-24 shrink-0">
                      <label className="text-[10px] font-black uppercase text-gray-400">Qty</label>
                      {!existingReq || (isPending && canApprove) ? (
                        <input
                          type="number" min="0.1" step="0.1" value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].quantity = Number(e.target.value);
                            setItems(newItems);
                          }}
                          className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-teal-500 font-bold text-center"
                        />
                      ) : <div className="font-bold text-center mt-2">{item.quantity}</div>}
                    </div>

                    <div className="w-20 shrink-0">
                      <label className="text-[10px] font-black uppercase text-gray-400">Unit</label>
                      {(!existingReq || (isPending && canApprove)) && item.is_custom ? (
                        <select
                          value={item.unit}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].unit = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none font-bold"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="L">L</option>
                          <option value="pcs">pcs</option>
                          <option value="pkt">pkt</option>
                        </select>
                      ) : <div className="font-bold text-gray-500 mt-2 text-center bg-white border border-gray-200 rounded-lg py-1.5">{item.unit}</div>}
                    </div>

                    {!existingReq && (
                      <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="p-2 mb-0.5 text-gray-400 hover:text-rose-500 bg-white border border-gray-200 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!existingReq && (
                <button
                  onClick={() => setItems([...items, { inventory_item: "", item_name: "", quantity: 1, unit: "pcs", is_custom: false }])}
                  className="mt-4 flex items-center gap-2 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-lg"
                >
                  <Plus size={14} /> Add Another Item
                </button>
              )}

              {existingReq && isPending && canApprove && (
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                  <h3 className="text-sm font-black text-gray-800 uppercase mb-4">Admin Controls</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Est. Market Cost ৳</label>
                      <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} className="w-full p-2.5 border border-gray-200 rounded-xl font-bold outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Admin Note</label>
                      <input type="text" placeholder="Note..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl font-bold outline-none focus:border-teal-500" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Close</button>
          {!existingReq ? (
            <button onClick={handleSubmit} disabled={submitMutation.isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black">
              {submitMutation.isPending ? "Submitting..." : "Submit Requisition"}
            </button>
          ) : isPending && canApprove && (
            <>
              <button onClick={handleReject} disabled={reject.isPending} className="px-6 py-2 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-200">Reject</button>
              <button onClick={handleApprove} disabled={approve.isPending} className="px-6 py-2 bg-teal-600 text-white text-sm font-bold rounded-xl hover:bg-teal-700">Approve & Deduct</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}