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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 px-2">
        <div>
           <p className="text-[9px] font-black text-teal-600 uppercase tracking-[0.2em] mb-0.5">Academic Timeline</p>
           <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
             {format(currentDate, "MMMM yyyy")}
           </h2>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shadow-inner">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"><ChevronLeft size={16}/></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1 shrink-0">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest py-2">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 overflow-hidden">
        {days.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const dayEvents = allClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), date));
          const isToday = isSameDay(date, new Date());

          return (
            <div 
              key={i}
              onClick={() => isCurrentMonth && setSelectedDate(date)}
              className={`p-2 border rounded-2xl cursor-pointer transition-all flex flex-col items-start gap-1 relative overflow-hidden group
                ${!isCurrentMonth ? 'opacity-20 pointer-events-none bg-slate-50 border-transparent' : 'hover:border-teal-200'}
                ${isSelected ? 'border-teal-500 bg-teal-50/20 shadow-sm z-10 scale-[1.01]' : 'border-slate-50 bg-white'}
                ${isToday && !isSelected ? 'bg-teal-50/30' : ''}
              `}
            >
              <span className={`text-[10px] font-black leading-none mb-1 
                ${isSelected ? 'text-teal-600' : 'text-slate-400'} 
                ${isToday ? 'bg-teal-600 text-white px-1.5 py-0.5 rounded-md' : ''}`}>
                {format(date, "d")}
              </span>
              
              <div className="flex flex-col gap-1 w-full overflow-y-auto no-scrollbar">
                {dayEvents.map((event, idx) => (
                  <div 
                    key={event._id || idx} 
                    className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold truncate leading-tight
                      ${event.isHoliday 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : isSelected ? 'bg-teal-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-teal-50'
                      }`}
                  >
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