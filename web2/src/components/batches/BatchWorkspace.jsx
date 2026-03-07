import React, { useState, useMemo, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { ArrowLeft, LayoutGrid, Calendar as CalendarIcon, Sparkles, X, BookOpen, ListChecks, Plus, ClipboardCheck } from "lucide-react";

// Components
import ClassCalendar from "./ClassCalendar";
import DayAgendaPanel from "./DayAgendaPanel";
import ClassDetailsPanel from "./ClassDetailsPanel";
import CurriculumBuilderModal from "./CurriculumBuilderModal";
import MarkClassCompleteModal from "./MarkClassCompleteModal";
import ClassRequisitionModal from "./ClassRequisitionModal";
import AttendanceBook from "../../pages/batches/AttendanceBook"; 
import BatchCurriculumList from "./BatchCurriculumList";
import Loader from "../../components/Loader";

// Hooks
import useAuth from "../../store/useAuth";
import { useUpdateClassAttendance, useAutoSchedule } from "../../hooks/useClasses";
import { useSubmitRequisition } from "../../hooks/useRequisitions";
import { useHolidays } from "../../hooks/useHolidays";

export default function BatchWorkspace({
  batch,
  allClasses = [],
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  onBack,
}) {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'curriculum' | 'attendance'
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [classToComplete, setClassToComplete] = useState(null);
  const [requisitionClass, setRequisitionClass] = useState(null);

  const updateMutation = useUpdateClassAttendance();
  const { mutate: autoSchedule, isPending: isAutoScheduling } = useAutoSchedule(batch?._id);

  // Sync selected class with fresh data
  useEffect(() => {
    if (selectedClass && allClasses?.length > 0) {
      const fresh = allClasses.find(c => c._id === selectedClass._id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedClass)) {
        setSelectedClass(fresh);
      }
    }
  }, [allClasses, selectedClass]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedClass(null);
    setIsSidebarOpen(true);
  };

  // 🚀 New function to open sidebar from anywhere
  const handleOpenClassDetails = (cls) => {
    if (cls.date_scheduled) {
        setSelectedDate(new Date(cls.date_scheduled));
    }
    setSelectedClass(cls);
    setIsSidebarOpen(true);
  };

  const dayClasses = useMemo(() => {
    return allClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate));
  }, [allClasses, selectedDate]);

  if (!batch) return <Loader />;

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      
      {/* 🟢 TOP HEADER */}
      <header className="shrink-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 md:px-6 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 shadow-sm active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{batch.batch_name}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{batch.course?.course_name}</p>
          </div>
        </div>

        {/* 🟢 NAVIGATION TABS */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => { setActiveTab("calendar"); setIsSidebarOpen(false); }} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarIcon size={14} /> Calendar
          </button>
          <button onClick={() => { setActiveTab("curriculum"); setIsSidebarOpen(false); }} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'curriculum' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <BookOpen size={14} /> Curriculum
          </button>
          <button onClick={() => { setActiveTab("attendance"); setIsSidebarOpen(false); }} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ListChecks size={14} /> Attendance Matrix
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission("manage_curriculum") && (
            <button onClick={() => setIsCurriculumOpen(true)} className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-indigo-600 shadow-lg transition-all">
              <Plus size={14} className="inline mr-1" /> Import Master
            </button>
          )}
        </div>
      </header>

      {/* 🟢 MAIN AREA */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden min-h-0 relative">
        
        {/* CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <div className="h-full flex-1 bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col min-h-0">
            <ClassCalendar currentDate={currentDate} setCurrentDate={setCurrentDate} selectedDate={selectedDate} setSelectedDate={handleDateChange} allClasses={allClasses} />
          </div>
        )}

        {/* CURRICULUM VIEW */}
        {activeTab === "curriculum" && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <BatchCurriculumList 
                batch={batch} 
                classes={allClasses} 
                onSelectClass={handleOpenClassDetails} // 🚀 Pass trigger
            />
          </div>
        )}

        {/* ATTENDANCE VIEW */}
        {activeTab === "attendance" && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <AttendanceBook batch={batch} classes={allClasses} />
          </div>
        )}

        {/* 🚀 SIDEBAR DRAWER (Now includes full content) */}
        <div 
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
          onClick={() => setIsSidebarOpen(false)} 
        />
        
        <div className={`fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#f8fafc] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          {/* Sidebar Header */}
          <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
            <div>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Schedule Details</p>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{format(selectedDate, "EEEE, MMM dd")}</h2>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2.5 bg-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-slate-50">
                <CalendarIcon size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Daily Agenda</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <DayAgendaPanel classes={dayClasses} selectedClass={selectedClass} onSelectClass={setSelectedClass} date={selectedDate} />
              </div>
            </div>

            <div className="shrink-0 max-h-[50%] bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-slate-50">
                <ClipboardCheck size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Operations</h3>
              </div>
              <div className="flex-1 overflow-hidden p-2">
                <ClassDetailsPanel 
                  cls={selectedClass} 
                  hasPermission={hasPermission}
                  onMarkAttendance={() => setClassToComplete(selectedClass)}
                  onOpenRequisition={() => setRequisitionClass(selectedClass)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isCurriculumOpen && <CurriculumBuilderModal batch={batch} onClose={() => setIsCurriculumOpen(false)} />}
      <MarkClassCompleteModal isOpen={!!classToComplete} onClose={() => setClassToComplete(null)} classData={classToComplete} batchData={batch} onSave={updateMutation.mutateAsync} />
      <ClassRequisitionModal isOpen={!!requisitionClass} onClose={() => setRequisitionClass(null)} classData={requisitionClass} batchData={batch} />
    </div>
  );
}