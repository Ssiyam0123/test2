import React, { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ClassCalendar({ currentDate, setCurrentDate, selectedDate, setSelectedDate, allClasses }) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8 px-4">
        <div>
           <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] mb-1">Academic Timeline</p>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
             {format(currentDate, "MMMM yyyy")}
           </h2>
        </div>
        <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all shadow-sm"><ChevronLeft size={18}/></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all shadow-sm"><ChevronRight size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4 border-b border-slate-50 pb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {days.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const hasClass = allClasses.some(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), date));
          const isToday = isSameDay(date, new Date());

          return (
            <div 
              key={i}
              onClick={() => isCurrentMonth && setSelectedDate(date)}
              className={`min-h-[110px] p-3 border-2 rounded-[2rem] cursor-pointer transition-all flex flex-col items-start gap-1 relative overflow-hidden
                ${!isCurrentMonth ? 'opacity-10 pointer-events-none bg-slate-50' : 'hover:border-teal-200'}
                ${isSelected ? 'border-teal-500 bg-teal-50/20 shadow-md ring-4 ring-teal-500/5' : 'border-slate-50 bg-white'}
                ${isToday && !isSelected ? 'ring-2 ring-teal-100' : ''}
              `}
            >
              <span className={`text-xs font-black ${isSelected ? 'text-teal-600' : 'text-slate-400'} ${isToday ? 'bg-teal-600 text-white px-2 py-0.5 rounded-lg' : ''}`}>
                {format(date, "d")}
              </span>
              
              {hasClass && (
                <div className="flex flex-col gap-1 w-full mt-2">
                  <div className="h-1.5 w-full bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)] animate-pulse"></div>
                  <div className="text-[8px] font-black text-teal-700 uppercase truncate px-1">Session Mapped</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}