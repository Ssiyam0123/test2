import React, { useState, useMemo } from "react";
import { X, Plus, Trash2, DownloadCloud, Save, LayoutList, PlusCircle, ArrowLeft, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useMasterTopics } from "../../hooks/useMasterSyllabus"; 
import { useAddSyllabusItems } from "../../hooks/useClasses";

export default function CurriculumBuilderModal({ batch, onClose }) {
  const [view, setView] = useState("selection"); 
  const [rows, setRows] = useState([]);

  const { data: masterRes, isLoading: isLoadingMaster } = useMasterTopics(); 
  const { mutate: saveToBatch, isPending } = useAddSyllabusItems(batch._id);

  // 🚀 Logic: Import from Master and Append
  const handleImport = () => {
    const masterData = masterRes?.data || [];
    if (masterData.length === 0) return toast.error("Library is empty!");

    const importedRows = masterData.map((item, idx) => ({
      topic: item.topic,
      class_type: item.class_type || "Lecture",
      order_index: rows.length + idx + 1,
      description: item.description || ""
    }));

    setRows(prev => [...prev, ...importedRows]);
    setView("form");
    toast.success(`${importedRows.length} topics added!`);
  };

  const handleAddRow = () => {
    const nextOrder = rows.length > 0 ? Math.max(...rows.map(r => Number(r.order_index))) + 1 : 1;
    setRows([...rows, { topic: "", class_type: "Lecture", order_index: nextOrder, description: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // 🚀 Smart Remove: Recalculates order_index after deletion
  const handleRemoveRow = (index) => {
    const filtered = rows.filter((_, i) => i !== index).map((row, i) => ({
      ...row,
      order_index: i + 1
    }));
    setRows(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = rows.filter(r => r.topic.trim() !== "");
    if (finalData.length === 0) return toast.error("Please add at least one topic.");
    
    saveToBatch(finalData, { 
        onSuccess: () => {
            toast.success("Curriculum synced successfully!");
            onClose();
        } 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {view !== "selection" && (
              <button onClick={() => setView("selection")} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Curriculum Builder</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Batch: {batch.batch_name} • {rows.length} Topics
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
          {view === "selection" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-10 max-w-3xl mx-auto">
              <button 
                onClick={handleImport}
                disabled={isLoadingMaster}
                className="flex flex-col items-center text-center p-10 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] hover:border-indigo-400 hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <DownloadCloud size={32} />
                </div>
                <h3 className="text-lg font-black text-indigo-900">Import Master</h3>
                <p className="text-[10px] text-indigo-600/60 font-bold mt-2 uppercase">Sync from Global Library</p>
              </button>

              <button 
                onClick={() => setView("form")}
                className="flex flex-col items-center text-center p-10 bg-teal-50 border-2 border-teal-100 rounded-[2.5rem] hover:border-teal-400 hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-600 mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <PlusCircle size={32} />
                </div>
                <h3 className="text-lg font-black text-teal-900">Manual Builder</h3>
                <p className="text-[10px] text-teal-600/60 font-bold mt-2 uppercase">Create custom structure</p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutList size={14} /> List Composition
                </h4>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setRows([])}
                        className="px-3 py-1.5 text-rose-500 text-[10px] font-black uppercase hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1"
                    >
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button 
                        onClick={handleAddRow}
                        className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
                    >
                        <Plus size={14} /> Add New Row
                    </button>
                </div>
              </div>

              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-[1.5rem] group hover:border-indigo-300 transition-all">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-1">
                        <input 
                          type="number" value={row.order_index} 
                          onChange={(e) => handleChange(idx, "order_index", e.target.value)}
                          className="w-full bg-slate-100 border-none rounded-lg py-2 text-center text-xs font-black text-slate-500"
                        />
                      </div>
                      <div className="col-span-6">
                        <input 
                          type="text" placeholder="Topic name..."
                          value={row.topic} onChange={(e) => handleChange(idx, "topic", e.target.value)}
                          className="w-full border-none focus:ring-0 px-1 py-1 text-sm font-bold text-slate-700 outline-none"
                        />
                        <input 
                          type="text" placeholder="Brief description or recipes..."
                          value={row.description} onChange={(e) => handleChange(idx, "description", e.target.value)}
                          className="w-full border-none focus:ring-0 px-1 text-[10px] font-medium text-slate-400 outline-none mt-1"
                        />
                      </div>
                      <div className="col-span-4">
                        <select 
                          value={row.class_type} onChange={(e) => handleChange(idx, "class_type", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-600 outline-none"
                        >
                          <option value="Lecture">Lecture</option>
                          <option value="Lab">Lab / Practical</option>
                          <option value="Exam">Exam / Review</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => handleRemoveRow(idx)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {view === "form" && (
          <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 italic">Total Classes to be generated: {rows.filter(r => r.topic).length}</p>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Cancel</button>
                <button 
                onClick={handleSubmit} disabled={isPending || rows.length === 0}
                className="px-10 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
                >
                {isPending ? "Processing..." : <><Save size={18} /> Sync with Batch</>}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}