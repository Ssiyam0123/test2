import React from "react";
import { format } from "date-fns";
import { BookOpen, Palmtree, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";

export default function DayAgendaPanel({ classes = [], selectedClass, onSelectClass, date }) {
  const safeClasses = Array.isArray(classes) ? classes : [];
  const isHolidayToday = safeClasses.some(c => c.isHoliday);

  if (safeClasses.length === 0) {
    return (
      <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 rotate-3">
          <BookOpen size={24} className="text-slate-300" />
        </div>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Free Day</h3>
        <p className="text-[11px] text-slate-400 mt-2 font-bold">
          No classes scheduled for {format(date, "MMM dd")}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 h-full">
      {safeClasses.map((cls) => {
        const isSelected = selectedClass?._id === cls._id;

        // 🏖️ HOLIDAY CARD (Slim)
        if (cls.isHoliday) {
          return (
            <div key={cls._id} className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-[1.5rem] flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500 shrink-0">
                <Palmtree size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-100 px-1.5 py-0.5 rounded mb-0.5 inline-block">Off Day</span>
                <h4 className="text-sm font-black text-rose-900 truncate tracking-tight">{cls.topic}</h4>
              </div>
            </div>
          );
        }

        // 📚 REGULAR CLASS CARD
        return (
          <button
            key={cls._id}
            onClick={() => onSelectClass(cls)}
            className={`group w-full text-left p-3.5 rounded-[1.5rem] border transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
              isSelected ? "bg-white border-teal-500 shadow-lg shadow-teal-500/10 scale-[1.01] z-10" : "bg-white border-slate-100 hover:border-teal-200 hover:shadow-md"
            }`}
          >
            {/* Active Indicator Bar */}
            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-full" />}

            <div className="flex items-center justify-between gap-2 w-full pl-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${
                  isSelected ? "bg-teal-500 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600"
                }`}>
                  {cls.class_number}
                </div>
                <div className="min-w-0">
                  <h4 className={`text-sm font-black truncate tracking-tight transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {cls.topic}
                  </h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cls.class_type}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                {cls.is_completed ? (
                  <CheckCircle size={18} className="text-emerald-500" />
                ) : (
                  <ChevronRight size={16} className={`transition-transform ${isSelected ? 'translate-x-1 text-teal-500' : 'text-slate-300'}`} />
                )}
              </div>
            </div>

            {/* Badges (Only render if there are any) */}
            {(isHolidayToday || (cls.requisition_status && cls.requisition_status !== "none")) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-50 pl-1 mt-1">
                {isHolidayToday && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-amber-100">
                    <AlertTriangle size={10} /> Conflict
                  </span>
                )}
                {cls.requisition_status && cls.requisition_status !== "none" && (
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border ${
                    cls.requisition_status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                    cls.requisition_status === "rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}>
                    REQ: {cls.requisition_status}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}