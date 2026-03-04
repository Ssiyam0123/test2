import React from "react";
import { PackageSearch } from "lucide-react";
import { useBranchInventory } from "../../hooks/useInventory";
import Loader from "../../components/Loader";

export default function PantryView({ branchId }) {
  const { data: res, isLoading } = useBranchInventory(branchId);
  const inventory = res?.data || [];

  if (isLoading) return <div className="py-20 flex justify-center"><Loader /></div>;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-700">
        <PackageSearch size={20} />
        <h2 className="text-sm font-black uppercase tracking-widest">Physical Stock Count</h2>
      </div>
      <div className="overflow-auto max-h-[600px] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Item Name</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">In Stock</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventory.map((item) => (
              <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-bold text-slate-800 capitalize">{item.item_name}</td>
                <td className="p-4 text-right font-black text-slate-700">
                  {item.quantity_in_stock} <span className="text-xs text-slate-400">{item.unit}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${
                    item.quantity_in_stock <= (item.reorder_threshold || 5) 
                    ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {item.quantity_in_stock <= (item.reorder_threshold || 5) ? "Low Stock" : "Healthy"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}