import React, { useState } from "react";
import { PackageSearch, Plus, AlertCircle } from "lucide-react";
import AddStockModal from "../../components/inventory/AddStockModal";
import { useBranchInventory } from "../../hooks/useInventory";
import Loader from "../../components/Loader";

export default function ManageInventory() {
  // NOTE: If you have a global branch selector, pull the branchId from there. 
  // For now, I'm hardcoding a dummy ID so the UI renders. Replace this with your actual active branch state!
  const [activeBranchId, setActiveBranchId] = useState("65a1b2c3d4e5f6g7h8i9j0k1"); 
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: inventoryResponse, isLoading } = useBranchInventory(activeBranchId);
  const inventory = inventoryResponse?.data || [];

  return (
    <div className="h-full flex flex-col p-4 md:p-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Track Pantry Stock & Procurement
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3.5 bg-teal-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Stock Purchase
        </button>
      </div>

      {/* INVENTORY TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700">
            <PackageSearch size={20} />
            <h2 className="text-base font-black uppercase tracking-widest">Current Pantry Stock</h2>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center min-h-[400px]">
              <Loader />
            </div>
          ) : inventory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
              <PackageSearch size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-bold">Pantry is empty</p>
              <p className="text-sm">Log a purchase to start tracking inventory.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">In Stock</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inventory.map((item) => {
                  const isLowStock = item.quantity_in_stock <= (item.reorder_threshold || 5);
                  
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-slate-800 capitalize">{item.item_name}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-lg font-black text-slate-700">
                          {item.quantity_in_stock} <span className="text-xs text-slate-400 uppercase">{item.unit}</span>
                        </p>
                      </td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            <AlertCircle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL PORTAL */}
      <AddStockModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        branchId={activeBranchId} 
      />
      
    </div>
  );
}