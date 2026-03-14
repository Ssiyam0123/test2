import React, { useState } from "react";
import { 
  ArrowRightLeft, History, ArrowDownToLine, ArrowUpFromLine, Wallet 
} from "lucide-react";
import { useBranchTransactions } from "../../hooks/useInventory";
import Loader from "../../components/Loader";
import { format } from "date-fns";

export default function InventoryHistory({ branchId }) {
  // CLEAN DATA FETCHING
  const { data: transactions = [], isLoading } = useBranchTransactions(branchId);
  
  // TABS STATE
  const [activeTab, setActiveTab] = useState("in"); // "in" or "out"

  if (isLoading) return <div className="py-20 flex justify-center h-full items-center"><Loader /></div>;

  // FILTER DATA BASED ON TABS
  const inTransactions = transactions.filter(t => t.transaction_type === "PURCHASE");
  const outTransactions = transactions.filter(t => t.transaction_type !== "PURCHASE"); // Issues/Requisitions
  
  const currentData = activeTab === "in" ? inTransactions : outTransactions;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500 flex flex-col h-full">
      
      {/* HEADER SECTION */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
               <ArrowRightLeft size={18} strokeWidth={2.5} />
             </div>
             <h2 className="text-xl font-black text-slate-800 tracking-tight">Stock Ledger</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-12">
            Inventory Movement & Chain of Custody
          </p>
        </div>
        
        <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
          <History size={14} className="text-slate-400" />
          <span className="text-xs font-black text-slate-700">{currentData.length} Records</span>
        </div>
      </div>

      {/* TAB BUTTONS */}
      <div className="px-6 md:px-8 pt-6 pb-2">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
          <button 
            onClick={() => setActiveTab("in")}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "in" ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ArrowDownToLine size={16} /> Stock IN (Purchases)
          </button>
          <button 
            onClick={() => setActiveTab("out")}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === "out" ? "bg-white text-amber-600 shadow-sm border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ArrowUpFromLine size={16} /> Stock OUT (Issues)
          </button>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar bg-slate-50/30">
        {currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 h-full py-20">
            <History size={64} className="mb-4 opacity-10" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-500">
              No {activeTab === "in" ? "Purchases" : "Issues"} Recorded
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Date & TXN ID</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Action</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Impact</th>
                
                {activeTab === "in" && (
                  <th className="p-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right">Total Cost</th>
                )}
                
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chain of Custody (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((txn) => {
                const isPurchase = activeTab === "in";
                
                return (
                  <tr key={txn._id} className="hover:bg-white transition-colors group bg-transparent">
                    
                    {/* 1. Date & TXN ID */}
                    <td className="p-5 pl-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-800">
                          {format(new Date(txn.createdAt), "dd MMM, yyyy")}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span>{format(new Date(txn.createdAt), "hh:mm a")}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="uppercase font-mono">TXN-{txn._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Item & Movement Badge */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${isPurchase ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                          {isPurchase ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 capitalize">
                            {txn.inventory_item?.item_name || "Unknown Item"}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isPurchase ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isPurchase ? 'Stock In (Purchase)' : 'Stock Out (Issued)'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Quantity Impact */}
                    <td className="p-5 text-center">
                      <div className={`inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl text-sm font-black border ${isPurchase ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                        {isPurchase ? "+" : "-"} {Math.abs(txn.quantity)}
                        <span className="text-[10px] font-bold opacity-70 lowercase">
                          {txn.inventory_item?.unit || 'units'}
                        </span>
                      </div>
                    </td>

                    {/* 4. TOTAL COST (Only for IN) */}
                    {isPurchase && (
                      <td className="p-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-emerald-700 flex items-center gap-1">
                            <Wallet size={14} className="opacity-50" />
                            ৳{txn.total_cost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Total Paid</span>
                        </div>
                      </td>
                    )}

                    {/* 5. CHAIN OF CUSTODY */}
                    <td className="p-5">
                      <div className="flex flex-col gap-3">
                        {isPurchase ? (
                          <>
                            {/* Stock IN (Purchase) View */}
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-black uppercase tracking-widest rounded w-20 text-center shrink-0">Supplied By</span>
                              <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{txn.supplier || "Local Market"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest rounded w-20 text-center shrink-0">Logged By</span>
                              <span className="text-xs font-black text-slate-800">
                                {txn.performed_by?.full_name || "System"} 
                                <span className="text-[9px] font-bold text-slate-400 font-normal ml-1">
                                  ({txn.performed_by?.role?.name || "Admin"})
                                </span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Stock OUT (Requisition) View */}
                            <div className="flex items-start gap-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase tracking-widest rounded w-20 text-center shrink-0 mt-0.5">Req. From</span>
                              <div className="flex flex-col">
                                
                                {/* 🚀 UPDATED LOGIC HERE: prioritizing requested_by */}
                                <span className="text-xs font-black text-slate-800">
                                  {txn.requested_by?.full_name || txn.reference_class?.instructor?.full_name || "System Request"} 
                                  <span className="text-[9px] font-bold text-slate-400 font-normal ml-1">
                                    ({txn.requested_by?.role?.name || "Instructor"})
                                  </span>
                                </span>
                                
                                <span className="text-[10px] font-bold text-indigo-600 mt-0.5 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded inline-block w-fit">
                                  {txn.reference_class?.batch?.batch_name || "Batch"} • {txn.reference_class?.topic || `Class ${txn.reference_class?.class_number || "X"}`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-widest rounded w-20 text-center shrink-0">Accepted By</span>
                              <span className="text-xs font-black text-slate-800">
                                {txn.performed_by?.full_name || "Admin Name"}
                                <span className="text-[9px] font-bold text-slate-400 font-normal ml-1">
                                  ({txn.performed_by?.role?.name || "Admin"})
                                </span>
                              </span>
                            </div>
                          </>
                        )}
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