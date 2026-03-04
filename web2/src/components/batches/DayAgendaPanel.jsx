import React from "react";
import { format } from "date-fns";
import { Clock, CheckCircle2, Circle } from "lucide-react";

export default function DayAgendaPanel({ classes, selectedClass, onSelectClass, date }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm h-full flex flex-col overflow-hidden min-h-[400px]">
      
      {/* 🗓 Selected Date Header */}
      <div className="mb-6 px-2">
        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Agenda for</p>
        <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">
          {format(date, "EEEE, MMM dd")}
        </h3>
      </div>

      {/* 📋 Class List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {classes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10 opacity-60">
            <Clock size={40} strokeWidth={1} className="mb-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">
              No classes mapped<br/>for this date
            </p>
          </div>
        ) : (
          classes.map((cls, index) => {
            const isSelected = selectedClass?._id === cls._id;
            const isDone = cls.is_completed;

            return (
              <div
                key={cls._id}
                onClick={() => onSelectClass(cls)}
                className={`relative group cursor-pointer transition-all duration-300 p-5 rounded-3xl border-2 flex items-center gap-4 active:scale-95
                  ${isSelected 
                    ? 'border-teal-500 bg-teal-50/30 shadow-md' 
                    : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                  }
                `}
              >
                {/* 🛠 Status Icon */}
                <div className={`shrink-0 transition-colors ${isSelected ? 'text-teal-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                  {isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </div>

                {/* 🛠 Class Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Class {String(cls.class_number || index + 1).padStart(2, '0')}
                    </span>
                    {isDone && (
                        <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                            Finalized
                        </span>
                    )}
                  </div>
                  <h4 className={`text-sm font-bold truncate ${isDone ? 'text-slate-500 line-through opacity-60' : 'text-slate-800'}`}>
                    {cls.topic}
                  </h4>
                </div>

                {/* 🛠 Selection Arrow (Only visible when selected) */}
                {isSelected && (
                   <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-teal-500 rounded-l-full shadow-[0_0_10px_rgba(20,184,166,0.4)]"></div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 💡 Footer Stats */}
      {classes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center px-2">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Classes Today</span>
                <span className="text-sm font-black text-slate-800 tracking-tighter">{classes.length} Sessions</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-100"></div>
            <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Progress</span>
                <span className="text-sm font-black text-teal-600 tracking-tighter">
                    {classes.filter(c => c.is_completed).length} / {classes.length}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}