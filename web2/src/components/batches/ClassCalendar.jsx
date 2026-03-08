import React, { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfToday, isValid } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ClassCalendar({ currentDate, setCurrentDate, selectedDate, setSelectedDate, allClasses = [] }) {
  
  const safeCurrentDate = isValid(new Date(currentDate)) ? new Date(currentDate) : new Date();
  const safeSelectedDate = isValid(new Date(selectedDate)) ? new Date(selectedDate) : new Date();
  const today = startOfToday();

  const eventsMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(allClasses)) return map;
    allClasses.forEach(cls => {
      if (cls.date_scheduled && isValid(new Date(cls.date_scheduled))) {
        const dateKey = format(new Date(cls.date_scheduled), "yyyy-MM-dd");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(cls);
      }
    });
    return map;
  }, [allClasses]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(safeCurrentDate));
    const end = endOfWeek(endOfMonth(safeCurrentDate));
    return eachDayOfInterval({ start, end });
  }, [safeCurrentDate]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2 shrink-0">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{format(safeCurrentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-2">
          {!isSameMonth(safeCurrentDate, today) && (
            <button onClick={() => { setCurrentDate(today); setSelectedDate(today); }} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-colors uppercase tracking-widest">Today</button>
          )}
          <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button onClick={() => setCurrentDate(subMonths(safeCurrentDate, 1))} className="p-1 hover:bg-white rounded"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentDate(addMonths(safeCurrentDate, 1))} className="p-1 hover:bg-white rounded"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2 shrink-0 bg-slate-50 rounded-xl border border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2.5">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0 overflow-hidden">
        {days.map((date, i) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const dayEvents = eventsMap[dateKey] || [];
          const isSelected = isSameDay(date, safeSelectedDate);
          const isCurrentMonth = isSameMonth(date, safeCurrentDate);
          const isToday = isSameDay(date, today);

          return (
            <div 
              key={i} onClick={() => isCurrentMonth && setSelectedDate(date)}
              className={`p-2 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-start gap-1.5 relative overflow-hidden group min-h-[70px]
                ${!isCurrentMonth ? 'opacity-20 pointer-events-none bg-slate-50 border-transparent' : 'bg-white hover:border-teal-200'}
                ${isSelected ? 'border-teal-500 shadow-md scale-[1.02] z-10' : 'border-slate-100'}
                ${isToday && !isSelected ? 'bg-teal-50/30 border-teal-100' : ''}
              `}
            >
              <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-md ${isSelected ? 'bg-teal-600 text-white' : isToday ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>
                {format(date, "d")}
              </span>
              
              <div className="flex flex-col gap-1 w-full overflow-y-auto no-scrollbar">
                {dayEvents.map((event, idx) => (
                  <div key={idx} className={`px-1.5 py-1 rounded text-[8px] font-bold truncate border ${event.is_completed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isSelected ? 'bg-teal-600 text-white border-transparent' : 'bg-slate-50 text-slate-600 border-slate-200 group-hover:border-teal-100'}`}>
                    {event.topic || `Class ${event.class_number}`}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}