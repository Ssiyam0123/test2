import React, { useState } from "react";
import { X, Plus, Trash2, DownloadCloud, Save, LayoutList, PlusCircle, ArrowLeft, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useMasterTopics } from "../../hooks/useMasterSyllabus"; 
import { useAddSyllabusItems } from "../../hooks/useClasses";
import Loader from "../../components/Loader";

export default function CurriculumBuilderModal({ batch, onClose }) {
  const [view, setView] = useState("selection"); 
  const [rows, setRows] = useState([{ topic: "", class_type: "Lecture", order_index: 1, description: "" }]);

  // Global Library থেকে ডাটা ফেচ করা
  const { data: masterRes, isLoading: isLoadingMaster } = useMasterTopics(); 
  const { mutate: saveToBatch, isPending } = useAddSyllabusItems(batch._id);

  const handleImport = () => {
    const masterData = masterRes?.data || [];
    if (masterData.length === 0) return toast.error("Library is empty! Populate Master Syllabus first.");

    const importedRows = masterData.map((item, idx) => ({
      topic: item.topic,
      class_type: item.class_type,
      order_index: idx + 1,
      description: item.description || ""
    }));

    setRows(importedRows);
    setView("form");
    toast.success(`${importedRows.length} topics loaded from Library!`);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = rows.filter(r => r.topic.trim() !== "");
    if (finalData.length === 0) return toast.error("Please add at least one topic.");
    
    saveToBatch(finalData, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {view !== "selection" && (
              <button onClick={() => setView("selection")} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-800">Batch Curriculum Builder</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Batch: {batch.batch_name} | Target Campus: {batch.branch?.branch_name || "Active"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
          
          {/* VIEW 1: SELECTION */}
          {view === "selection" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-10">
              <button 
                onClick={handleImport}
                disabled={isLoadingMaster}
                className="flex flex-col items-center text-center p-10 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <DownloadCloud size={32} />
                </div>
                <h3 className="text-lg font-black text-indigo-900">Import from Library</h3>
                <p className="text-xs text-indigo-600/60 font-bold mt-2 uppercase tracking-tight">Sync predefined topics instantly</p>
              </button>

              <button 
                onClick={() => setView("form")}
                className="flex flex-col items-center text-center p-10 bg-teal-50 border-2 border-teal-100 rounded-[2.5rem] hover:border-teal-400 hover:shadow-xl hover:shadow-teal-100 transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-600 mb-5 shadow-sm group-hover:scale-110 transition-transform">
                  <PlusCircle size={32} />
                </div>
                <h3 className="text-lg font-black text-teal-900">Manual Entry</h3>
                <p className="text-xs text-teal-600/60 font-bold mt-2 uppercase tracking-tight">Add custom classes for this batch</p>
              </button>
            </div>
          ) : (
            /* VIEW 2: FORM ENTRY */
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <LayoutList size={16} className="text-indigo-500" /> Syllabus Composition
                </h4>
                <button 
                  type="button" onClick={handleAddRow}
                  className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Topic
                </button>
              </div>

              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl group hover:border-indigo-300 transition-all shadow-sm">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-1">
                        <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Class</label>
                        <input 
                          type="number" value={row.order_index} 
                          onChange={(e) => handleChange(idx, "order_index", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg py-2 text-center text-xs font-black text-slate-600"
                        />
                      </div>
                      <div className="col-span-6">
                        <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Topic Name</label>
                        <input 
                          type="text" placeholder="e.g. Continental Cuisine-I"
                          value={row.topic} onChange={(e) => handleChange(idx, "topic", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white outline-none"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[9px] font-black text-slate-300 uppercase block mb-1">Class Type</label>
                        <select 
                          value={row.class_type} onChange={(e) => handleChange(idx, "class_type", e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[11px] font-bold text-slate-600 outline-none"
                        >
                          <option value="Lecture">Lecture</option>
                          <option value="Lab">Lab / Practical</option>
                          <option value="Exam">Exam / Review</option>
                        </select>
                      </div>
                      <div className="col-span-1 pt-4 text-right">
                        <button onClick={() => setRows(rows.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="col-span-12">
                        <input 
                          type="text" placeholder="Recipes / Details (Optional)"
                          value={row.description} onChange={(e) => handleChange(idx, "description", e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-medium text-slate-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        {view === "form" && (
          <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              onClick={handleSubmit} disabled={isPending}
              className="px-10 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
            >
              {isPending ? "Syncing..." : <><Save size={18} /> Sync with Batch</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}