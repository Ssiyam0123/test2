import React, { useMemo, useState } from "react";
import { Package, Plus, Trash2, Calculator } from "lucide-react";
import EntityForm from "../common/EntityForm"; 
import { useAddStockPurchase } from "../../hooks/useInventory";

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
    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Package size={18} className="text-teal-600" />
          <h3 className="text-sm font-black uppercase tracking-widest">Purchase List</h3>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          <Calculator size={14} className="text-teal-600" />
          <span className="text-xs font-bold text-teal-700">Bill Total: ৳{grandTotal.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-3 overflow-x-auto custom-scrollbar pb-2">
        <div className="flex gap-2 min-w-[700px] px-1">
          <label className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Name</label>
          <label className="w-32 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category*</label>
          <label className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</label>
          <label className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</label>
          <label className="w-28 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Price (৳)</label>
          <div className="w-10"></div>
        </div>

        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2 min-w-[700px] animate-in slide-in-from-top-1 duration-200">
            <input 
              type="text" required
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              placeholder="e.g. Chicken"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
            />
            {/* NEW CATEGORY SELECTOR */}
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
              className="w-28 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-right"
            />
            <button 
              type="button" onClick={() => handleRemoveItem(index)} disabled={value.length === 1}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 mt-4">
          <button 
            type="button" onClick={handleAddItem}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 px-2 py-1 transition-colors"
          >
            <Plus size={14} /> Add Item
          </button>
          <div className="text-right pr-12">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Payable</span>
            <span className="text-lg font-black text-slate-700">৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN MODAL COMPONENT
// ==========================================
export default function AddStockModal({ isOpen, onClose, branchId }) {
  const addStockMutation = useAddStockPurchase(branchId);

  if (!isOpen) return null;

  const formConfig = [
    {
      name: "items",
      type: "custom",
      fullWidth: true,
      render: ({ value, onChange }) => <DynamicStockField value={value || []} onChange={onChange} />
    },
    { divider: true, title: "Supplier Info" },
    {
      name: "supplier",
      label: "Shop / Vendor Name (Optional)", // CHANGED TO OPTIONAL
      type: "text",
      placeholder: "e.g. Local Market",
      required: false // NOT REQUIRED
    },
    {
      name: "notes",
      label: "Additional Notes",
      type: "text",
      placeholder: "e.g. Bought for tomorrow's baking class",
    }
  ];

  const handleSubmit = async (formDataObj, rawFormData) => {
    const { items, supplier, notes } = rawFormData;
    const total_cost = items.reduce((acc, curr) => acc + (Number(curr.rowTotal) || 0), 0);

    const payload = {
      items: items.map(i => ({
        item_name: i.name,
        category: i.category, // PASSING CATEGORY TO BACKEND
        quantity: Number(i.qty),
        unit: i.unit,
        total_price: Number(i.rowTotal)
      })),
      total_cost,
      supplier: supplier || "", // Handle empty string if optional
      notes,
      branch: branchId
    };

    try {
      await addStockMutation.mutateAsync(payload);
      onClose();
    } catch (error) {
      console.error("Stock addition failed", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl my-auto animate-in zoom-in-95 duration-200">
        <EntityForm
          title="Log Purchase"
          subtitle="Record goods bought and update the branch financial ledger."
          config={formConfig}
          initialData={{ items: [{ name: "", category: "", qty: "", unit: "kg", rowTotal: "" }] }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={addStockMutation.isPending}
          buttonText="Save & Update Ledger"
          buttonColor="bg-teal-600 hover:bg-teal-700 shadow-teal-500/20"
        />
      </div>
    </div>
  );
}