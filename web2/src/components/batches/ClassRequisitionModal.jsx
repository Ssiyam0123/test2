import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, ShoppingBag, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useBranchInventory } from "../../hooks/useInventory";

export default function ClassRequisitionModal({ isOpen, onClose, classData, batchData, onSave }) {
  const [items, setItems] = useState([{ item_name: "", quantity: "", unit: "kg" }]);
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const branchId = batchData?.branch?._id || batchData?.branch;
  const { data: invRes } = useBranchInventory(branchId);
  const inventoryItems = invRes?.data || [];

  useEffect(() => {
    if (isOpen) {
      const existingItems = classData?.requisitions?.length > 0 
        ? classData.requisitions 
        : [{ item_name: "", quantity: "", unit: "kg" }];
        
      setItems(existingItems);
      setBudget(classData?.financials?.budget || "");
    }
  }, [isOpen, classData]);

  if (!isOpen || !classData || !batchData) return null;

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
    
    const validItems = items.filter(item => item.item_name.trim() !== "" && Number(item.quantity) > 0);
    
    if (validItems.length === 0) {
      return toast.error("Please add at least one valid item with quantity.");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        class_content: classData._id,
        batch: batchData._id,
        branch: branchId,
        items: validItems.map(item => ({
          item_name: item.item_name,
          unit: item.unit,
          quantity: Number(item.quantity)
        })),
        budget: Number(budget) || 0
      };

      await onSave(payload);
      onClose(); 
      toast.success("Requisition submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* 🟢 HEADER */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
               <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Class {classData.class_number}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{classData._id.slice(-6)}</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <ShoppingBag size={22} className="text-teal-500" />
              Request Materials & Bazar
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* 🟢 BODY */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-8 flex gap-3 shadow-inner">
            <Info size={20} className="text-teal-600 shrink-0" />
            <p className="text-xs text-teal-800 font-medium leading-relaxed">
              Start typing an item name to see suggestions from the current pantry stock. You can also add custom items that are not in the store yet.
            </p>
          </div>

          <div className="space-y-4">
            {/* Table Headers */}
            <div className="grid grid-cols-12 gap-3 px-2 hidden sm:grid">
              <div className="col-span-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Description</div>
              <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</div>
              <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</div>
              <div className="col-span-1"></div>
            </div>

            {/* Dynamic Input Rows */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:border-teal-200 transition-all shadow-sm">
                
                <div className="sm:col-span-6 relative">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Item Name</label>
                  <input 
                    list={`inventory-suggestions-${index}`}
                    type="text" 
                    placeholder="e.g., Fresh Chicken"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                  <datalist id={`inventory-suggestions-${index}`}>
                    {inventoryItems.map(inv => (
                      <option key={inv._id} value={inv.item_name} />
                    ))}
                  </datalist>
                </div>

                <div className="sm:col-span-3 flex gap-3 sm:block">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Qty</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-center"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1 sm:hidden">Unit</label>
                  <select 
                    value={item.unit}
                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer transition-all"
                  >
                    {["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1 flex justify-end sm:justify-center mt-2 sm:mt-0">
                  <button 
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    disabled={items.length === 1}
                    className="p-2.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button 
              type="button"
              onClick={handleAddRow}
              className="w-full py-4 mt-2 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 text-xs font-black uppercase tracking-widest hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} /> Add Another Item
            </button>
          </div>

          {/* Budget Field */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Estimated Budget (Optional)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">৳</span>
              <input 
                type="number"
                placeholder="0.00"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* 🟢 FOOTER */}
        <div className="p-6 md:px-8 md:py-6 bg-white border-t border-slate-100 flex justify-end gap-4 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 shadow-xl shadow-slate-900/10 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {isSubmitting ? "Submitting..." : "Submit Requisition"}
          </button>
        </div>

      </div>
    </div>
  );
}