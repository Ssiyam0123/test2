import React from "react";
import { ArrowRightLeft, History, User, Calendar, Tag } from "lucide-react";
import { useBranchTransactions } from "../../hooks/useInventory";
import Loader from "../../components/Loader";
import { format } from "date-fns";

export default function InventoryHistory({ branchId }) {
  const { data: txnRes, isLoading } = useBranchTransactions(branchId);
  const transactions = txnRes?.data || [];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700">
          <ArrowRightLeft size={20} className="text-teal-600" />
          <h2 className="text-sm font-black uppercase tracking-widest">
            Stock Ledger (IN/OUT)
          </h2>
        </div>
        <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400 uppercase tracking-tighter">
          Total {transactions.length} Records
        </span>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 p-20">
            <History size={64} className="mb-4 opacity-10" />
            <p className="text-lg font-bold">No transactions found</p>
            <p className="text-xs font-medium uppercase tracking-widest">Your branch stock movements will appear here</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Movement Type</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Item</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity Change</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performed By / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((txn) => {
                const isPurchase = txn.transaction_type === "PURCHASE";
                
                return (
                  <tr key={txn._id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* 1. Date & Time */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {format(new Date(txn.createdAt), "dd MMM, yyyy")}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {format(new Date(txn.createdAt), "hh:mm a")}
                        </span>
                      </div>
                    </td>

                    {/* 2. Type Badge */}
                    <td className="p-5">
                      <span className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                        isPurchase 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {isPurchase ? "Stock IN (Purchase)" : "Stock OUT (Usage)"}
                      </span>
                    </td>

                    {/* 3. Item Name */}
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 group-hover:text-teal-500 transition-colors">
                          <Tag size={14} />
                        </div>
                        <span className="text-sm font-black text-slate-800 capitalize">
                          {txn.inventory_item?.item_name || "Unknown Item"}
                        </span>
                      </div>
                    </td>

                    {/* 4. Qty Change */}
                    <td className="p-5 text-right">
                      <span className={`text-sm font-black ${isPurchase ? "text-emerald-600" : "text-amber-600"}`}>
                        {isPurchase ? "+" : "-"} {txn.quantity}{" "}
                        <span className="text-[10px] font-bold opacity-60 ml-0.5 lowercase">
                          {txn.inventory_item?.unit || 'units'}
                        </span>
                      </span>
                    </td>

                    {/* 5. User & Notes */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <User size={12} className="text-slate-400" />
                          {txn.performed_by?.full_name || "System"}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic mt-1 truncate max-w-[200px]">
                          {isPurchase 
                            ? `Vendor: ${txn.supplier || "Not Listed"}` 
                            : `Class: ${txn.reference_class?.topic || "Consumption"}`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}