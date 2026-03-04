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
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all"><ChevronLeft /></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-xl text-slate-600 transition-all"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {days.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const hasClass = allClasses.some(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), date));

          return (
            <div 
              key={i}
              onClick={() => isCurrentMonth && setSelectedDate(date)}
              className={`min-h-[100px] p-3 border-2 rounded-3xl cursor-pointer transition-all flex flex-col items-start gap-1 relative overflow-hidden
                ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : 'hover:border-teal-200'}
                ${isSelected ? 'border-teal-500 bg-teal-50/30' : 'border-slate-50 bg-white'}
              `}
            >
              <span className={`text-xs font-black ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>{format(date, "d")}</span>
              
              {hasClass && (
                <div className="flex flex-col gap-1 w-full mt-1">
                  <div className="h-1.5 w-full bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                  <div className="text-[9px] font-bold text-teal-700 truncate px-1">Lecture Scheduled</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}