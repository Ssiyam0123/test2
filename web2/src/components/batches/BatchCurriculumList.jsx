import React, { useState } from "react";
import { Edit3, Trash2, CheckCircle, Clock, Save, ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { useDeleteClass, useScheduleClass, useUpdateClassContent } from "../../hooks/useClasses";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function BatchCurriculumList({ batch, classes, onSelectClass }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ topic: "", class_type: "" });

  const { mutate: deleteClass } = useDeleteClass(batch._id);
  const { mutate: reschedule } = useScheduleClass(batch._id);
  const { mutate: updateContent } = useUpdateClassContent(batch._id);

  const sortedClasses = [...(classes || [])].sort((a, b) => a.class_number - b.class_number);

  const handleReschedule = (classId, date) => {
    if (!date) return;
    reschedule({ classId, date_scheduled: date }, {
      onSuccess: () => toast.success("Schedule Updated!")
    });
  };

  const handleUpdate = (classId) => {
    updateContent({ classId, ...editForm }, {
      onSuccess: () => {
        setEditingId(null);
        toast.success("Content Updated!");
      }
    });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Syllabus Management</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {sortedClasses.map((cls) => (
            <div key={cls._id} className="p-4 border border-slate-100 rounded-2xl bg-white hover:border-indigo-200 transition-all group">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Topic Info - Clicking this opens details */}
                <div 
                  className="flex items-center gap-4 flex-1 min-w-[250px] cursor-pointer"
                  onClick={() => onSelectClass(cls)} // 🚀 Trigger Sidebar Details
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {cls.class_number}
                  </div>
                  {editingId === cls._id ? (
                    <div className="flex gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-bold" value={editForm.topic} onChange={(e) => setEditForm({...editForm, topic: e.target.value})} />
                      <select className="px-3 py-1.5 border rounded-lg text-xs font-bold" value={editForm.class_type} onChange={(e) => setEditForm({...editForm, class_type: e.target.value})}>
                        <option value="Lecture">Lecture</option>
                        <option value="Lab">Lab</option>
                        <option value="Assessment">Assessment</option>
                      </select>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 flex items-center gap-2 truncate">
                        {cls.topic} 
                        {cls.is_completed && <CheckCircle size={14} className="text-emerald-500" />}
                      </h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cls.class_type}</p>
                        <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Details <ArrowUpRight size={10} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Schedule & Actions */}
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-end">
                    <label className="text-[8px] font-black text-slate-400 uppercase mb-1">Date</label>
                    <input 
                      type="date" 
                      className="bg-slate-50 border-none text-xs font-bold p-1 rounded-lg outline-none focus:ring-1 focus:ring-teal-500"
                      value={cls.date_scheduled ? format(new Date(cls.date_scheduled), "yyyy-MM-dd") : ""}
                      onChange={(e) => handleReschedule(cls._id, e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1 pl-4 border-l border-slate-100">
                    {editingId === cls._id ? (
                      <button onClick={() => handleUpdate(cls._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Save size={18}/></button>
                    ) : (
                      <button onClick={() => { setEditingId(cls._id); setEditForm({ topic: cls.topic, class_type: cls.class_type }); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                    )}
                    <button onClick={() => deleteClass(cls._id)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}