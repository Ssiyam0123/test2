import React from "react";
import { format } from "date-fns";
import { BookOpen, Palmtree, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

export default function DayAgendaPanel({ classes = [], selectedClass, onSelectClass, date }) {
  if (classes.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center">
        <BookOpen size={32} className="text-slate-200 mb-2" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No classes scheduled</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {classes.map((cls) => {
        const isSelected = selectedClass?._id === cls._id;
        if (cls.isHoliday) return (
            <div key={cls._id} className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-center gap-3">
              <Palmtree size={20} />
              <span className="text-sm font-black uppercase tracking-tight">{cls.topic} (Holiday)</span>
            </div>
        );

        return (
          <button
            key={cls._id} onClick={() => onSelectClass(cls)}
            className={`w-full text-left p-4 rounded-[1.5rem] transition-all flex items-center justify-between border-2 ${
              isSelected ? "bg-white border-teal-500 shadow-md" : "bg-transparent border-transparent hover:bg-white/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"}`}>{cls.class_number}</div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 leading-none">{cls.topic}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{cls.class_type}</p>
              </div>
            </div>
            {cls.is_completed ? <CheckCircle size={18} className="text-emerald-500" /> : <ChevronRight size={16} className={isSelected ? "text-teal-500" : "text-slate-300"} />}
          </button>
        );
      })}
    </div>
  );
}