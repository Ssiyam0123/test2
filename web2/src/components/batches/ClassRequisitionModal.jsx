import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, ShoppingCart, Info } from "lucide-react";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// 🚀 হুক ইমপোর্ট করা হলো স্টোরের আইটেম সাজেশন দেখানোর জন্য
import { useBranchInventory } from "../../hooks/useInventory";

export default function ClassRequisitionModal({ isOpen, onClose, classData, batchData, onSave }) {
  const [items, setItems] = useState([{ item_name: "", quantity: "", unit: "kg" }]);
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 বর্তমান ব্রাঞ্চের ইনভেন্টরি ফেচ করা হচ্ছে
  const branchId = batchData?.branch?._id || batchData?.branch;
  const { data: invRes } = useBranchInventory(branchId);
  const inventoryItems = invRes?.data || [];

  // মডাল খুললে ডাটা রিসেট হবে
  useEffect(() => {
    if (isOpen) {
      setItems([{ item_name: "", quantity: "", unit: "kg" }]);
      setBudget("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setItems([...items, { item_name: "", quantity: "", unit: "kg" }]);
  };

  const handleRemoveRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    // 🚀 স্মার্ট লজিক: সাজেশন থেকে সিলেক্ট করলে ইউনিট অটোমেটিক বসে যাবে
    if (field === "item_name") {
      const matchedItem = inventoryItems.find(inv => inv.item_name.toLowerCase() === value.toLowerCase());
      if (matchedItem) {
        updated[index].unit = matchedItem.unit;
      }
    }
    
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ফিল্টার করে ফাঁকা রো বাদ দেওয়া
    const validItems = items.filter(item => item.item_name.trim() !== "" && Number(item.quantity) > 0);
    
    if (validItems.length === 0) {
      return toast.error("Please add at least one valid item with quantity.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        items: validItems.map(item => ({
          ...item,
          quantity: Number(item.quantity)
        })),
        budget: Number(budget) || 0
      };

      await onSave(classData._id, payload);
      // মডাল ক্লোজ হবে onSave এর ভেতর থেকেই
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShoppingCart size={24} className="text-indigo-500" />
              Request Bazar List
            </h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Class: {classData?.topic} | Batch: {batchData?.batch_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex gap-3">
            <Info size={20} className="text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-800 font-medium">
              Start typing an item name to see suggestions from the current inventory. You can also add custom items that are not in the store.
            </p>
          </div>

          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-2">
              <div className="col-span-6 text-[10px] font-black text-slate-400 uppercase">Item Name</div>
              <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase">Qty</div>
              <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Unit</div>
              <div className="col-span-1"></div>
            </div>

            {/* Dynamic Rows */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                <div className="col-span-6 relative">
                  {/* 🚀 Datalist Integration for Suggestions */}
                  <input 
                    list={`inventory-suggestions-${index}`}
                    type="text" 
                    placeholder="e.g., Chicken Breast"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <datalist id={`inventory-suggestions-${index}`}>
                    {inventoryItems.map(inv => (
                      <option key={inv._id} value={inv.item_name} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-3">
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <select 
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-xs font-bold text-slate-600 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button 
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-300 hover:text-rose-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button 
              type="button"
              onClick={handleAddRow}
              className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-700 mb-2">Estimated Budget (Optional)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">৳</span>
              <input 
                type="number"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader size={18} color="white" /> : <><Save size={18} /> Submit List</>}
          </button>
        </div>

      </div>
    </div>
  );
}