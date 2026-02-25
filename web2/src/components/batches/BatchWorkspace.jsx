import React, { useState } from "react";
import { ArrowLeft, FileText, Sparkles, Plus, Calendar as CalendarIcon, List } from "lucide-react";
import ClassCalendar from "./ClassCalendar";
import ClassSidebar from "./ClassSidebar";

export default function BatchWorkspace({
  batch='',
  authUser,
  allClasses = [],
  pendingClasses,
  classesOnSelectedDate,
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  viewTab,
  setViewTab,
  onBack,
  onShowSyllabus,
  onAddClass,
  onScheduleClass,
  onQuickSchedule,
  onEditClass,
  onDeleteClass,
  autoSchedule,
  isAutoScheduling
}) {
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState(null);
  
  // Mobile-specific state: "calendar" or "list"
  const [mobileView, setMobileView] = useState("calendar");

  const handleOpenAttendance = (cls) => {
    setSelectedAttendanceClass(cls);
    setViewTab("attendance");
  };

  const handleBackToDaily = () => {
    setSelectedAttendanceClass(null);
    setViewTab("daily");
  };

  // Helper to sync calendar clicks with the list view on mobile
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (window.innerWidth < 1024) {
      setMobileView("list");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 bg-white rounded-xl text-gray-500 hover:text-teal-600 shadow-sm transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-gray-800 truncate">{batch.batch_name}</h2>
            <p className="text-xs text-teal-600 font-bold uppercase tracking-tight">
              {batch.batch_type} • {batch.schedule_days?.join(", ")}
            </p>
          </div>
        </div>

        {/* Mobile View Switcher (Visible only on small screens) */}
        <div className="flex lg:hidden bg-white/50 p-1 rounded-2xl border border-white/60 self-center w-full sm:w-auto">
          <button 
            onClick={() => setMobileView("calendar")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${mobileView === "calendar" ? "bg-[#1e293b] text-white shadow-md" : "text-slate-600"}`}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
          <button 
            onClick={() => setMobileView("list")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${mobileView === "list" ? "bg-[#1e293b] text-white shadow-md" : "text-slate-600"}`}
          >
            <List size={16} /> Daily List
          </button>
        </div>

        {/* Action Buttons (Desktop and Tablet) */}
        <div className="hidden md:flex items-center gap-2">
           <button onClick={onShowSyllabus} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all">
            <FileText size={18} className="text-teal-500" />
          </button>
          {allClasses.some(c => !c.date_scheduled) && (
            <button 
              onClick={() => autoSchedule()}
              disabled={isAutoScheduling}
              className="px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles size={18} className={isAutoScheduling ? "animate-spin" : ""} /> Auto-Schedule
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        
        {/* Calendar View: Hidden on mobile if mobileView is 'list' */}
        <div className={`${mobileView === "list" ? "hidden lg:block" : "block"} h-full overflow-y-auto`}>
          <ClassCalendar 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate} 
            setSelectedDate={handleDateSelect}
            allClasses={allClasses} 
            setViewTab={setViewTab}
          />
        </div>

        {/* Sidebar View: Hidden on mobile if mobileView is 'calendar' */}
        <div className={`${mobileView === "calendar" ? "hidden lg:block" : "block"} h-full overflow-y-auto`}>
          <ClassSidebar 
            viewTab={viewTab} 
            setViewTab={setViewTab} 
            authUser={authUser}
            classesOnSelectedDate={classesOnSelectedDate} 
            pendingClasses={pendingClasses}
            onEditClass={onEditClass} 
            onDeleteClass={onDeleteClass}
            onAddClass={onAddClass} 
            onScheduleClass={onScheduleClass}
            onQuickSchedule={onQuickSchedule}
            batchStudent={batch?.students || []} 
            selectedAttendanceClass={selectedAttendanceClass}
            onOpenAttendance={handleOpenAttendance}
            onBackToDaily={handleBackToDaily}
          />
        </div>

      </div>

      {/* Mobile Floating Action Button (Optional but production-friendly) */}
      {mobileView === "list" && ['admin', 'registrar'].includes(authUser?.role) && (
        <button 
          onClick={onAddClass}
          className="lg:hidden fixed bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}