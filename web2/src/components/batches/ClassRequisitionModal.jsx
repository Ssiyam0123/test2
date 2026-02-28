import React, { useMemo, useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import EntityForm from "../common/EntityForm"; 

// ==========================================
// 1. CUSTOM DYNAMIC FIELD COMPONENT
// ==========================================
const DynamicItemsField = ({ value = [], onChange }) => {
  const unitOptions = ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"];

  const handleAddItem = () => {
    onChange([...value, { name: "", qty: "", unit: "kg" }]);
  };

  const handleRemoveItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...value];
    newItems[index][field] = val;
    onChange(newItems);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5">
      <div className="flex items-center gap-2 text-slate-700 mb-4">
        <ClipboardList size={18} />
        <h3 className="text-sm font-black uppercase tracking-widest">Bazar Requisition List</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex gap-2 px-1">
          <label className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Goods Name</label>
          <label className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</label>
          <label className="w-24 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</label>
          <div className="w-10"></div>
        </div>

        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2 group animate-in slide-in-from-top-1 duration-200">
            <input 
              type="text"
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
              placeholder="e.g. Chicken"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
            />
            <input 
              type="number"
              min="0"
              step="any"
              value={item.qty}
              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
              placeholder="0"
              className="w-20 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-center"
            />
            <select
              value={item.unit}
              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
              className="w-24 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            
            <button 
              type="button"
              onClick={() => handleRemoveItem(index)}
              disabled={value.length === 1}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button 
          type="button"
          onClick={handleAddItem}
          className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 px-2 py-1 transition-colors"
        >
          <Plus size={14} /> Add Another Item
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN MODAL COMPONENT
// ==========================================
export default function ClassRequisitionModal({ 
  isOpen, onClose, classData, onSave 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse existing data into EntityForm format
  const initialData = useMemo(() => {
    if (!classData) return {};
    
    const parsedItems = [];
    const savedNotes = classData.financials?.expense_notes || "";
    
    // Legacy support: If data exists in the old text format, parse it back into rows
    if (savedNotes) {
      const parts = savedNotes.split(", ");
      parts.forEach(part => {
        const match = part.match(/^([\d.]+)\s([a-zA-Z]+)\s(.+)$/);
        if (match) {
          parsedItems.push({ qty: match[1], unit: match[2], name: match[3] });
        } else {
          parsedItems.push({ name: part, qty: "", unit: "pcs" });
        }
      });
    }
    
    if (parsedItems.length === 0) {
      parsedItems.push({ name: "", qty: "", unit: "kg" });
    }

    return { items: parsedItems };
  }, [classData]);

  if (!isOpen) return null;

  // Define EntityForm structure - strictly the items now
  const formConfig = [
    {
      name: "items",
      type: "custom",
      fullWidth: true,
      render: ({ value, onChange }) => <DynamicItemsField value={value || []} onChange={onChange} />
    }
  ];

  const handleSubmit = async (formDataObj, rawFormData) => {
    setIsSubmitting(true);
    const { items } = rawFormData;

    // Map the dynamic rows directly into the Requisition array structure for the backend
    const validRequisitionItems = items
      .filter(item => item.name && item.name.trim() !== "") 
      .map(item => ({
        item_name: item.name.trim(),
        quantity: Number(item.qty) || 1,
        unit: item.unit
      }));

    // Build the exact payload Joi is expecting
    const payload = {
      requisition: validRequisitionItems
    };

    try {
      await onSave(classData._id, payload);
      onClose();
    } catch (error) {
      console.error("Failed to save requisition", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-3xl my-auto animate-in zoom-in-95 duration-200">
        <EntityForm
          title={classData?.topic}
          subtitle={`Class ${classData?.class_number} • Requisition`}
          config={formConfig}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isSubmitting}
          buttonText="Save Requisition"
          buttonColor="bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
        />
      </div>
    </div>
  );
}