import React, { useState, useEffect, useMemo } from "react";
import {
  useClassRequisition,
  useSubmitRequisition,
  useApproveRequisition,
  useRejectRequisition,
} from "../../hooks/useRequisitions";
import { useInventory } from "../../hooks/useInventory";
import {
  X,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Loader2,
  Clock,
  History,
  AlertCircle,
} from "lucide-react";
import useAuth from "../../store/useAuth";
import { PERMISSIONS } from "../../config/permissionConfig";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function ClassRequisitionModal({
  isOpen,
  onClose,
  classData,
  batchData,
}) {
  const { hasPermission } = useAuth();

  const canSend = hasPermission(PERMISSIONS.SEND_REQUISITION);
  const canApproveAction = hasPermission(
    PERMISSIONS.INVENTORY_REQUISITION_ACTION,
  );

  const { data: reqRes, isLoading: reqLoading } = useClassRequisition(
    classData?._id,
  );
  const requisitions = useMemo(
    () => (Array.isArray(reqRes) ? reqRes : reqRes?.data || []),
    [reqRes],
  );

  const { data: inventoryList, isLoading: invLoading } = useInventory(
    batchData?.branch?._id || batchData?.branch,
  );

  const submitMutation = useSubmitRequisition();
  const approveMutation = useApproveRequisition();
  const rejectMutation = useRejectRequisition();

  const [items, setItems] = useState([
    {
      inventory_item: "",
      item_name: "",
      quantity: 1,
      unit: "pcs",
      is_custom: false,
    },
  ]);
  const [adminNote, setAdminNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(
      (i) => i.item_name.trim() !== "" && Number(i.quantity) > 0,
    );
    if (validItems.length === 0)
      return Swal.fire("Error", "Add at least one item", "error");

    const payload = {
      class_content: classData._id,
      batch: batchData._id,
      branch: batchData?.branch?._id || batchData?.branch,
      items: validItems.map((item) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        is_custom: item.is_custom,
        ...(!item.is_custom &&
          item.inventory_item && { inventory_item: item.inventory_item }),
      })),
    };

    submitMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("New Requisition Sent!");
        setItems([
          {
            inventory_item: "",
            item_name: "",
            quantity: 1,
            unit: "pcs",
            is_custom: false,
          },
        ]);
      },
    });
  };

  const handleApprove = (reqId, currentItems) => {
    approveMutation.mutate(
      {
        id: reqId,
        payload: { items: currentItems, admin_note: adminNote },
      },
      { onSuccess: () => toast.success("Approved & Stock Released!") },
    );
  };

  const handleReject = (reqId) => {
    rejectMutation.mutate(
      {
        id: reqId,
        admin_note: adminNote || "Requisition denied.",
      },
      { onSuccess: () => toast.error("Requisition Rejected.") },
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        {/* Header */}
        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-500 rounded-2xl shadow-lg">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">
                Class Logistics Manager
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {batchData?.batch_name} • {classData?.topic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-2xl transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-[#f8fafc] grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: New Request Form (Only for Instructors/Staff) */}
          <div className="lg:col-span-7 space-y-6">
            {canSend ? (
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Plus size={16} className="text-teal-500" /> Create New
                  Requisition
                </h3>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 animate-in slide-in-from-top-1"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          {/* Item Selection Dropdown */}
                          <select
                            value={
                              item.is_custom
                                ? "custom"
                                : item.inventory_item || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              const newItems = [...items];
                              if (val === "custom") {
                                newItems[index] = {
                                  ...item,
                                  is_custom: true,
                                  inventory_item: "",
                                  item_name: "",
                                  unit: "",
                                };
                              } else {
                                const selectedInv = inventoryList.find(
                                  (i) => i._id === val,
                                );
                                newItems[index] = {
                                  ...item,
                                  is_custom: false,
                                  inventory_item: val,
                                  item_name: selectedInv?.item_name || "",
                                  unit: selectedInv?.unit || "pcs",
                                };
                              }
                              setItems(newItems);
                            }}
                            className="w-full p-3 text-xs border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 font-bold bg-white"
                          >
                            <option value="" disabled>
                              Select Item...
                            </option>
                            {inventoryList?.map((inv) => (
                              <option key={inv._id} value={inv._id}>
                                {inv.item_name}

                                {/* ({inv.quantity_in_stock} {inv.unit}) */}
                              </option>
                            ))}
                            <option value="custom">
                              ➕ Other (Market Purchase)
                            </option>
                          </select>

                          {/* Custom Item Details: Name and Unit */}
                          {item.is_custom && (
                            <div className="flex gap-2 animate-in zoom-in-95">
                              <input
                                type="text"
                                placeholder="Item Name (e.g. Fresh Flowers)"
                                value={item.item_name}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[index].item_name = e.target.value;
                                  setItems(newItems);
                                }}
                                className="flex-[2] p-3 text-xs border-2 border-teal-100 rounded-xl outline-none font-bold"
                              />
                              <input
                                type="text"
                                placeholder="Unit (kg/pcs)"
                                value={item.unit}
                                onChange={(e) => {
                                  const newItems = [...items];
                                  newItems[index].unit = e.target.value;
                                  setItems(newItems);
                                }}
                                className="flex-1 p-3 text-xs border-2 border-teal-100 rounded-xl outline-none font-bold"
                              />
                            </div>
                          )}
                        </div>

                        {/* Quantity and Delete Button */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center bg-white border-2 border-slate-100 rounded-xl px-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newItems = [...items];
                                newItems[index].quantity = e.target.value;
                                setItems(newItems);
                              }}
                              className="w-12 p-3 text-xs font-black text-center outline-none bg-transparent"
                            />
                            {!item.is_custom && (
                              <span className="text-[10px] font-bold text-slate-400 pr-2">
                                {item.unit}
                              </span>
                            )}
                          </div>

                          {items.length > 1 && (
                            <button
                              onClick={() =>
                                setItems(items.filter((_, i) => i !== index))
                              }
                              className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() =>
                      setItems([
                        ...items,
                        {
                          inventory_item: "",
                          item_name: "",
                          quantity: 1,
                          unit: "pcs",
                          is_custom: false,
                        },
                      ])
                    }
                    className="py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:border-teal-500 hover:text-teal-600 transition-all"
                  >
                    + Add More Material
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    {submitMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                    Submit New Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <AlertCircle size={40} className="text-slate-300 mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Read-Only Mode
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  You don't have permission to create new requests.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: History & Approval */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex items-center gap-2 ml-2">
              <History size={16} /> Requisition History ({requisitions.length})
            </h3>

            <div className="space-y-4">
              {reqLoading ? (
                <Loader2 className="animate-spin mx-auto mt-10 text-slate-300" />
              ) : requisitions.length === 0 ? (
                <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase italic">
                  No history found
                </p>
              ) : (
                requisitions.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group"
                  >
                    {/* Status Strip */}
                    <div
                      className={`absolute top-0 left-0 w-1 h-full ${req.status === "approved" ? "bg-emerald-500" : req.status === "rejected" ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`}
                    ></div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">
                          {new Date(req.createdAt).toLocaleDateString()} at{" "}
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p
                          className={`text-[9px] font-black uppercase mt-1 px-2 py-0.5 rounded w-fit ${
                            req.status === "approved"
                              ? "bg-emerald-50 text-emerald-600"
                              : req.status === "rejected"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {req.status}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">
                        By: {req.requested_by?.full_name?.split(" ")[0]}
                      </p>
                    </div>

                    <div className="space-y-1 mb-4">
                      {req.items.map((it, idx) => (
                        <p
                          key={idx}
                          className="text-xs font-bold text-slate-600 flex justify-between"
                        >
                          <span>• {it.item_name}</span>
                          <span className="text-slate-400">
                            {it.quantity} {it.unit}
                          </span>
                        </p>
                      ))}
                    </div>

                    {/* Admin Actions for Pending Requisitions */}
                    {req.status === "pending" && canApproveAction && (
                      <div className="pt-4 border-t border-slate-50 space-y-3">
                        <textarea
                          placeholder="Admin note..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="w-full p-3 text-[10px] font-bold bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-teal-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(req._id)}
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition-all"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(req._id, req.items)}
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-widest text-white bg-teal-500 rounded-lg hover:bg-teal-600 shadow-lg shadow-teal-100 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    )}

                    {req.admin_note && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100 italic text-[9px] text-slate-400">
                        " {req.admin_note} "
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
          >
            Close Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
