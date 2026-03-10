import React from "react";
import { Trash2, CheckCircle, CalendarIcon, Loader2, BookOpen, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import useAuth from "../../store/useAuth";
import { PERMISSIONS } from "../../config/permissionConfig";
import { confirmDelete } from "../../utils/swalUtils"; // 🚀 Reusable Swal

export default function BatchCurriculumList({ batch, classes, onSelectClass, deleteClass, autoSchedule, isAutoScheduling, openImport, onReschedule }) {
  const { hasPermission } = useAuth();
  const sortedClasses = [...(classes || [])].sort((a, b) => a.class_number - b.class_number);

  // 🚀 গ্র্যানুলার পারমিশন ফ্ল্যাগস
  const canManageCurriculum = hasPermission(PERMISSIONS.CURRICULUM_MATRIX);
  const canReschedule = hasPermission(PERMISSIONS.VIEW_BATCH_CALENDAR);

  const handleAutoSchedule = () => {
    autoSchedule(undefined, { onSuccess: () => toast.success("Batch Auto-Scheduled!") });
  };

  const handleDeleteClick = (id, topic) => {
    confirmDelete({
      title: "Remove Class Content?",
      text: `Are you sure you want to remove "${topic}" from this batch curriculum?`,
      confirmText: "Yes, delete content",
      onConfirm: () => deleteClass(id)
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
           <BookOpen size={16} className="text-indigo-500"/> Curriculum Matrix
        </h3>
        
        {/* 🚀 কারিকুলাম ম্যানেজমেন্ট কন্ট্রোল */}
        {canManageCurriculum && (
          <div className="flex gap-2">
            <button onClick={openImport} className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-100 transition-colors shadow-sm">
              <BookOpen size={14} className="inline mr-1" /> Import Master
            </button>
            <button onClick={handleAutoSchedule} disabled={isAutoScheduling} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-teal-600 transition-all shadow-md disabled:opacity-70">
              {isAutoScheduling ? <Loader2 size={14} className="inline mr-1 animate-spin" /> : <CalendarIcon size={14} className="inline mr-1" />} 
              Auto-Assign Dates
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl p-2 space-y-2 bg-slate-50/50">
        {sortedClasses.map((cls) => (
          <div key={cls._id} onClick={() => onSelectClass(cls)} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600">{cls.class_number}</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  {cls.topic} {cls.is_completed && <CheckCircle size={14} className="text-emerald-500" />}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cls.class_type}</span>
                   <span className="text-slate-200">•</span>
                   <span className={`text-[10px] font-black uppercase ${cls.date_scheduled ? 'text-indigo-500' : 'text-rose-400'}`}>
                     {cls.date_scheduled ? format(new Date(cls.date_scheduled), "dd MMM, yyyy") : "Unscheduled"}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {/* 🚀 রিসেডিউল বাটন: ক্যালেন্ডার পারমিশন থাকলে দেখাবে */}
              {canReschedule && (
                <button onClick={() => onReschedule(cls)} className="p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg" title="Reschedule">
                  <CalendarDays size={18}/>
                </button>
              )}
              {/* 🚀 ডিলিট বাটন: কারিকুলাম পারমিশন থাকলে দেখাবে */}
              {canManageCurriculum && (
                <button onClick={() => handleDeleteClick(cls._id, cls.topic)} className="p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 rounded-lg" title="Delete Topic">
                  <Trash2 size={18}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}