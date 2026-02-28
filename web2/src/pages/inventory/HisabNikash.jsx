import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, Filter, Calculator, ArrowDownRight, ArrowUpRight, 
  Beef, Milk, Carrot, PackageOpen, Wrench, Box, HelpCircle
} from "lucide-react";
import { useBranchInventory, useBranchTransactions } from "../../hooks/useInventory";
import Loader from "../../components/Loader";

// 1. INDUSTRY STANDARD ICON MAPPING
const getCategoryIcon = (category) => {
  const iconProps = { size: 18, className: "text-slate-500" };
  switch (category) {
    case "Meat": return <Beef {...iconProps} className="text-rose-500" />;
    case "Dairy": return <Milk {...iconProps} className="text-blue-500" />;
    case "Produce": return <Carrot {...iconProps} className="text-orange-500" />;
    case "Dry Goods": return <PackageOpen {...iconProps} className="text-amber-600" />;
    case "Equipment": return <Wrench {...iconProps} className="text-slate-600" />;
    case "Packaging": return <Box {...iconProps} className="text-indigo-500" />;
    default: return <HelpCircle {...iconProps} />;
  }
};

export default function HisabNikash() {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const { data: invRes, isLoading: invLoading } = useBranchInventory(branchId);
  const { data: txnRes, isLoading: txnLoading } = useBranchTransactions(branchId);

  // ==========================================
  // VALUATION ENGINE (The "Hisab" Logic)
  // ==========================================
  const { valuationData, kpis } = useMemo(() => {
    const inventory = invRes?.data || [];
    const transactions = txnRes?.data || [];

    // 1. Find the Last Purchase Price for every item to estimate current value
    const latestPrices = {};
    transactions.forEach(txn => {
      if (txn.transaction_type === "PURCHASE" && txn.inventory_item) {
        const itemId = typeof txn.inventory_item === 'object' ? txn.inventory_item._id : txn.inventory_item;
        
        // If we haven't mapped this item yet (transactions are usually sorted newest first)
        if (!latestPrices[itemId] && txn.quantity > 0) {
          latestPrices[itemId] = txn.total_cost / txn.quantity; 
        }
      }
    });

    // 2. Map inventory with financial data
    let totalPantryValue = 0;
    const enrichedInventory = inventory.map(item => {
      const unitPrice = latestPrices[item._id] || 0;
      const stockValue = item.quantity_in_stock * unitPrice;
      totalPantryValue += stockValue;

      return {
        ...item,
        estimated_unit_price: unitPrice,
        total_value: stockValue
      };
    });

    // 3. Apply User Filters
    const filtered = enrichedInventory.filter(item => {
      const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort by Total Value (Highest financial risk at the top)
    filtered.sort((a, b) => b.total_value - a.total_value);

    return {
      valuationData: filtered,
      kpis: {
        totalValue: totalPantryValue,
        totalItems: enrichedInventory.length,
        lowStockItems: enrichedInventory.filter(i => i.quantity_in_stock <= (i.reorder_threshold || 5)).length
      }
    };
  }, [invRes, txnRes, searchTerm, filterCategory]);

  if (invLoading || txnLoading) return <div className="h-screen flex justify-center items-center"><Loader /></div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* HEADER & KPIS */}
      <div className="mb-8 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Stock Valuation</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Estimated financial worth of current pantry
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm min-w-[160px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Asset Value</p>
            <h3 className="text-2xl font-black text-teal-700 flex items-center gap-1">
              ৳{kpis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm min-w-[140px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Items Tracked</p>
            <h3 className="text-2xl font-black text-slate-800">{kpis.totalItems}</h3>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-t-[2rem] border border-slate-200 border-b-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer"
          >
            {["All", "Meat", "Dairy", "Produce", "Dry Goods", "Equipment", "Packaging", "Other"].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* INDUSTRY STANDARD DATA GRID */}
      <div className="bg-white rounded-b-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Qty in Stock</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Est. Unit Price</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Total Asset Value</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {valuationData.map((item) => {
                const isLowStock = item.quantity_in_stock <= (item.reorder_threshold || 5);
                const hasValue = item.total_value > 0;

                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* Column 1: Product Name & Category Icon */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 capitalize">{item.item_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Quantity (Right Aligned) */}
                    <td className="p-5 text-right">
                      <p className="text-sm font-black text-slate-700">
                        {item.quantity_in_stock} <span className="text-xs text-slate-400 font-bold ml-0.5">{item.unit}</span>
                      </p>
                    </td>

                    {/* Column 3: Unit Price (Calculated) */}
                    <td className="p-5 text-right">
                      <p className="text-sm font-bold text-slate-500">
                        {item.estimated_unit_price > 0 
                          ? `৳${item.estimated_unit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : "—"}
                      </p>
                    </td>

                    {/* Column 4: Total Asset Value (Highlight Column) */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasValue && <Calculator size={14} className="text-teal-500/50" />}
                        <p className={`text-sm font-black ${hasValue ? 'text-teal-700' : 'text-slate-400'}`}>
                          {hasValue 
                            ? `৳${item.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : "৳0.00"}
                        </p>
                      </div>
                    </td>

                    {/* Column 5: Status Badge */}
                    <td className="p-5 text-center">
                      <div className="flex justify-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            <ArrowDownRight size={12} strokeWidth={3} /> Reorder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            <ArrowUpRight size={12} strokeWidth={3} /> Optimal
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {valuationData.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-slate-600">No records found</p>
                      <p className="text-sm mt-1">Try adjusting your search or category filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}