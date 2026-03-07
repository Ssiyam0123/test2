import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useInventory, useBranchTransactions } from "../../hooks/useInventory"; 
import Loader from "../../components/Loader";

export default function HisabNikashView({ branchId }) { 
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: invRes, isLoading: invLoading } = useInventory(branchId);
  const { data: txnRes, isLoading: txnLoading } = useBranchTransactions(branchId);

  const { valuationData, totalValue } = useMemo(() => {
    const inventory = invRes?.data || [];
    const transactions = txnRes?.data || [];
    const prices = {};
    
    // Calculate latest price per item based on purchase history
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

    return { valuationData: data, totalValue: total };
  }, [invRes, txnRes, searchTerm]);

  if (invLoading || txnLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Asset Value</p>
          <h3 className="text-2xl font-black text-teal-700">৳{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
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
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 font-bold text-sm">
         Table/List of {valuationData.length} items can be rendered here...
      </div>
    </div>
  );
}