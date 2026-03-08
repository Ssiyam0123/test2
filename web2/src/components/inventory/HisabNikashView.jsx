import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useInventory, useBranchTransactions } from "../../hooks/useInventory"; 
import Loader from "../../components/Loader";

export default function HisabNikashView({ branchId }) { 
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: inventory = [], isLoading: invLoading } = useInventory(branchId);
  const { data: transactions = [], isLoading: txnLoading } = useBranchTransactions(branchId);

  const { valuationData, totalValue } = useMemo(() => {
    const prices = {};
    
    transactions.forEach(t => {
      if (t.transaction_type === "PURCHASE") {
        const id = t.inventory_item?._id || t.inventory_item;
        if (!prices[id] && t.quantity > 0) {
           prices[id] = t.total_cost / t.quantity;
        }
      }
    });

    let total = 0;
    const data = inventory.map(item => {
      const unitPrice = prices[item._id] || 0;
      const val = item.quantity_in_stock * unitPrice;
      total += val;
      return { ...item, total_value: val, unit_price: unitPrice };
    }).filter(i => i.item_name.toLowerCase().includes(searchTerm.toLowerCase()));

    data.sort((a, b) => b.total_value - a.total_value);

    return { valuationData: data, totalValue: total };
  }, [inventory, transactions, searchTerm]);

  if (invLoading || txnLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Asset Value</p>
          <h3 className="text-2xl font-black text-teal-700">
            ৳{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Filter assets..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>
      </div>
      
      {/* REAL TABLE RENDERED HERE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px]">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 outline outline-1 outline-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Qty</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Avg. Unit Price</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {valuationData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center">
                    <p className="text-sm font-bold text-slate-400">No assets found matching your search.</p>
                  </td>
                </tr>
              ) : (
                valuationData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-800 capitalize">{item.item_name}</td>
                    
                    <td className="p-4 text-right font-black text-slate-700">
                      {item.quantity_in_stock} <span className="text-[10px] text-slate-400 font-bold ml-0.5">{item.unit}</span>
                    </td>
                    
                    <td className="p-4 text-right font-bold text-slate-500">
                      ৳{item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    
                    <td className="p-4 text-right font-black text-teal-700">
                      ৳{item.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}