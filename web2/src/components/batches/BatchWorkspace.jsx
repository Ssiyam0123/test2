import React from "react";
import { ArrowLeft, FileText, Sparkles, Plus } from "lucide-react";
import ClassCalendar from "./ClassCalendar";
import ClassSidebar from "./ClassSidebar";
import { useState } from "react";

/**
 * BatchWorkspace Component
 * Ei component-ti Batch management er main workspace hisebe kaj kore.
 * Ekhane Header, Calendar ebong Sidebar-er coordination kora hoyeche.
 */
export default function BatchWorkspace({
  batch,
  authUser,
  allClasses,
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

  const handleOpenAttendance = (cls) => {
    setSelectedAttendanceClass(cls);
    setViewTab("attendance");
  };

  const handleBackToDaily = () => {
    setSelectedAttendanceClass(null);
    setViewTab("daily");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Workspace Header - Batch Details and Action Buttons */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 bg-white rounded-xl text-gray-500 hover:text-teal-600 shadow-sm transition-colors"
            title="Go back to list"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-800">{batch.batch_name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium uppercase tracking-tighter">
              {/* Batch Preset er bodole ekhon Schedule Days dekhano hochche */}
              <span className="text-teal-600 font-bold">{batch.batch_type}</span>
              <span>•</span>
              <span>{batch.schedule_days?.join(", ")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Show Syllabus / Classes Button */}
          <button 
            onClick={onShowSyllabus} 
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-2 transition-all"
          >
            <FileText size={18} className="text-teal-500" /> Show Classes
          </button>

          {/* Auto-Schedule Button: Sudhu jodi unscheduled class thake tokhon e dekhabe */}
          {allClasses.some(c => !c.date_scheduled) && (
            <button 
              onClick={() => autoSchedule()}
              disabled={isAutoScheduling || !batch.start_date}
              className="px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
              title={!batch.start_date ? "Missing Batch Start Date" : "Generate calendar based on schedule"}
            >
              <Sparkles size={18} className={isAutoScheduling ? "animate-spin" : ""} /> 
              {isAutoScheduling ? "Processing..." : "Auto-Schedule"}
            </button>
          )}
          
          {/* Add Class Button: Sudhu Admin ba Registrar er jonno */}
          {['admin', 'registrar'].includes(authUser?.role) && (
            <button 
              onClick={onAddClass} 
              className="px-4 py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-md flex items-center gap-2 transition-all"
            >
              <Plus size={18} /> Add Class
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 min-h-0">
        
        {/* Reusable Calendar Component */}
        <ClassCalendar 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate}
          selectedDate={selectedDate} 
          setSelectedDate={setSelectedDate}
          allClasses={allClasses} 
          setViewTab={setViewTab}
        />

        {/* Daily & Pending Lists */}
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
  );
}