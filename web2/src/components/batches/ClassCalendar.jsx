import React, { useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ফ্রন্টএন্ডেও ছুটির তালিকা রাখা হলো ভিউজুয়ালাইজেশনের জন্য
const bdHolidays = [
  "02-21", "03-17", "03-26", "04-14", "05-01", "08-15", "12-16", "12-25",
  "2026-03-03", "2026-03-20", "2026-03-21", "2026-03-22", 
  "2026-05-27", "2026-05-28", "2026-05-29", "2026-06-26", "2026-10-21"
];

const checkIsHoliday = (dateToCheck) => {
  const monthDay = format(dateToCheck, "MM-dd");
  const fullDate = format(dateToCheck, "yyyy-MM-dd");
  return bdHolidays.includes(monthDay) || bdHolidays.includes(fullDate);
};

export default function ClassCalendar({ currentDate, setCurrentDate, selectedDate, setSelectedDate, allClasses, setViewTab }) {
  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-800">{format(currentDate, "MMMM yyyy")}</h1>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm hover:bg-teal-50 flex items-center justify-center text-teal-700"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm hover:bg-teal-50 flex items-center justify-center text-teal-700"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4 px-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 gap-2.5 px-2 pb-2 overflow-y-auto custom-scrollbar">
        {daysInMonth.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isSelected = isSameDay(date, selectedDate);
          const hasClass = allClasses.some(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), date));
          const isHoliday = checkIsHoliday(date);
          
          return (
            <button
              key={i}
              onClick={() => { setSelectedDate(date); setViewTab("daily"); }}
              className={`relative flex flex-col items-start justify-between p-3 rounded-2xl min-h-[100px] transition-all duration-200 border border-transparent
                ${!isCurrentMonth ? 'opacity-30 pointer-events-none bg-gray-50/50' : 'bg-white shadow-sm hover:border-teal-200'}
                ${isHoliday && !isSelected ? 'bg-red-50/50 text-red-500 border-red-100' : ''} 
                ${isSelected ? '!bg-[#14b8a6] !text-white !shadow-lg z-10' : ''}
              `}
              title={isHoliday ? "Public Holiday" : ""}
            >
              <span className={`font-bold text-lg ${isHoliday && !isSelected ? 'text-red-400' : ''}`}>
                {format(date, "d")}
              </span>
              
              {/* Holiday indicator dot */}
              {isHoliday && !hasClass && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-300 mt-auto"></div>
              )}
              
              {/* Class indicator dot */}
              {hasClass && (
                <div className={`w-full h-1.5 rounded-full mt-auto ${isSelected ? 'bg-white/40' : 'bg-teal-500'}`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}