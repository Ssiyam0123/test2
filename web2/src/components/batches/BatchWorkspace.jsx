import React, { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ArrowLeft, LayoutGrid, Calendar as CalendarIcon } from "lucide-react";
import ClassCalendar from "./ClassCalendar";
import DayAgendaPanel from "./DayAgendaPanel";
import ClassDetailsPanel from "./ClassDetailsPanel";
import Loader from "../../components/Loader";
import useAuth from "../../store/useAuth";

export default function BatchWorkspace({ 
  batch, allClasses, currentDate, setCurrentDate, 
  selectedDate, setSelectedDate, onBack 
}) {
  const { hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedClass(null); 
  };

  const dayClasses = useMemo(() => {
    return allClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate));
  }, [allClasses, selectedDate]);

  if (!batch) return <Loader />;

  return (
    // 🚀 এখানে h-screen এবং overflow-hidden দিয়ে পুরো পেজ ফিক্সড করা হয়েছে
    <div className="w-full h-screen max-h-screen flex flex-col bg-[#f1f5f9] overflow-hidden font-sans">
      
      {/* 🟢 HEADER: Shrink-0 যাতে এটি ফিক্সড থাকে */}
      <header className="shrink-0 p-4 md:px-10 md:pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 shadow-sm transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 bg-teal-500 text-white text-[8px] font-black uppercase tracking-widest rounded">BATCH ACTIVE</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{batch.course?.course_name}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic uppercase">{batch.batch_name}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 🟢 SCROLLABLE AREA: ক্যালেন্ডার এবং নিচের গ্রিড এখানে থাকবে */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:px-10 md:pb-10 space-y-6">
        
        {/* TOP: CALENDAR (বড় স্ক্রিনে যাতে এটি বেশি জায়গা না নেয়) */}
        <section className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm overflow-hidden">
          <ClassCalendar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            allClasses={allClasses}
          />
        </section>

        {/* BOTTOM: GRID AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: DAY AGENDA (1/3) */}
          <div className="lg:col-span-1 flex flex-col min-h-[400px]">
             <div className="flex items-center gap-2 px-2 mb-3">
                <CalendarIcon size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Today's Schedule</h3>
             </div>
             <div className="flex-1">
                <DayAgendaPanel 
                  classes={dayClasses} 
                  selectedClass={selectedClass} 
                  onSelectClass={setSelectedClass} 
                  date={selectedDate}
                />
             </div>
          </div>

          {/* RIGHT: DETAILED OVERVIEW (2/3) */}
          <div className="lg:col-span-2 flex flex-col min-h-[400px]">
             <div className="flex items-center gap-2 px-2 mb-3">
                <LayoutGrid size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Class Operations</h3>
             </div>
             <div className="flex-1">
                <ClassDetailsPanel 
                  cls={selectedClass} 
                  hasPermission={hasPermission} 
                />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}