import React, { useState, useEffect } from "react";
import { Package, Plus, Trash2, Calculator, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm"; 
import { useAddStockPurchase } from "../../hooks/useInventory";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader";

const CATEGORIES = ["Meat", "Dairy", "Produce", "Dry Goods", "Equipment", "Packaging", "Other"];
const UNITS = ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"];

// ==========================================
// 1. DYNAMIC STOCK ITEMS COMPONENT
// ==========================================
const DynamicStockField = ({ value = [], onChange }) => {
  const handleAddItem = () => {
    onChange([...value, { name: "", category: "", qty: "", unit: "kg", rowTotal: "" }]);
  };

  const handleRemoveItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...value];
    newItems[index][field] = val;
    onChange(newItems);
  };

  const grandTotal = value.reduce((sum, item) => sum + (Number(item.rowTotal) || 0), 0);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 lg:p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-700">
          <Package size={20} className="text-teal-600" />
          <h3 className="text-base font-black uppercase tracking-widest">Bazar List Details</h3>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">
          <Calculator size={16} className="text-teal-600" />
          <span className="text-sm font-black text-teal-700">Bill Total: ৳{grandTotal.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-3 overflow-x-auto custom-scrollbar pb-4">
        <div className="flex gap-2 min-w-[700px] px-1">
          <label className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Name</label>
          <label className="w-32 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category*</label>
          <label className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</label>
          <label className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</label>
          <label className="w-32 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Price (৳)</label>
          <div className="w-10"></div>
        </div>

        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2 min-w-[700px] animate-in slide-in-from-top-1 duration-200">
            <input 
              type="text" required
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              placeholder="e.g. Broiler Chicken"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
            <select
              required
              value={item.category}
              onChange={(e) => handleItemChange(index, "category", e.target.value)}
              className="w-32 px-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>Select...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              type="number" required min="0.01" step="any"
              value={item.qty}
              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
              placeholder="0"
              className="w-20 px-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-center"
            />
            <select
              required value={item.unit}
              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
              className="w-20 px-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all cursor-pointer"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input 
              type="number" required min="0" step="any"
              value={item.rowTotal}
              onChange={(e) => handleItemChange(index, "rowTotal", e.target.value)}
              placeholder="৳180"
              className="w-32 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-right"
            />
            <button 
              type="button" onClick={() => handleRemoveItem(index)} disabled={value.length === 1}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-slate-200/60 mt-4 gap-4">
          <button 
            type="button" onClick={handleAddItem}
            className="flex items-center justify-center gap-1.5 text-sm font-black text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl transition-colors w-full sm:w-auto"
          >
            <Plus size={16} /> Add Another Row
          </button>
          <div className="text-right pr-12 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subtotal</span>
            <span className="text-2xl font-black text-slate-700">৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================
export default function AddInventory() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  // Safely extract the branch ID
  const activeBranchId = typeof authUser?.branch === 'object' 
    ? authUser?.branch?._id 
    : authUser?.branch;

  const addStockMutation = useAddStockPurchase(activeBranchId);

  // If no branch is found (e.g., admin hasn't selected one or auth is loading), show a loader or error
  if (!activeBranchId) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  const formConfig = [
    {
      name: "items",
      type: "custom",
      fullWidth: true,
      render: ({ value, onChange }) => <DynamicStockField value={value || []} onChange={onChange} />
    },
    { divider: true, title: "Invoice Details" },
    {
      name: "supplier",
      label: "Shop / Vendor Name (Optional)", 
      type: "text",
      placeholder: "e.g. Karwan Bazar, Meena Bazar",
      required: false
    },
    {
      name: "notes",
      label: "Reference Notes",
      type: "text",
      placeholder: "e.g. Bought for tomorrow's baking class",
    }
  ];

  const handleSubmit = async (formDataObj, rawFormData) => {
    const { items, supplier, notes } = rawFormData;
    
    // Summing up the grand total
    const total_cost = items.reduce((acc, curr) => acc + (Number(curr.rowTotal) || 0), 0);

    const payload = {
      items: items.map(i => ({
        item_name: i.name,
        category: i.category,
        quantity: Number(i.qty),
        unit: i.unit,
        total_price: Number(i.rowTotal)
      })),
      total_cost,
      supplier: supplier || "",
      notes,
      branch: activeBranchId
    };

    try {
      await addStockMutation.mutateAsync(payload);
      // On success, redirect back to the manage inventory page
      navigate("/admin/manage-inventory");
    } catch (error) {
      console.error("Stock addition failed", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} // Goes back to the previous page
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-teal-600 uppercase tracking-widest mb-4 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Log Stock Purchase</h1>
        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
          Record physical goods and update financial ledger
        </p>
      </div>

      {/* FORM SECTION */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
        <EntityForm
          // We don't need the title/subtitle here since we built our own header above
          config={formConfig}
          initialData={{ items: [{ name: "", category: "", qty: "", unit: "kg", rowTotal: "" }] }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin/manage-inventory")}
          isLoading={addStockMutation.isPending}
          buttonText="Confirm & Post to Ledger"
          buttonColor="bg-teal-600 hover:bg-teal-700 shadow-teal-500/20"
        />
      </div>

    </div>
  );
}