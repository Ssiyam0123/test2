import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  X,
  PanelRightOpen,
  LayoutGrid,
  ClipboardList,
  CalendarDays
} from "lucide-react";
import ClassCalendar from "./ClassCalendar";
import ClassSidebar from "./ClassSidebar";
import Loader from "../../components/Loader";
import MarkClassCompleteModal from "./MarkClassCompleteModal";
import ClassRequisitionModal from "./ClassRequisitionModal";
import CurriculumBuilderModal from "./CurriculumBuilderModal"; 

// 🚀 Hooks
import { useUpdateClassAttendance } from "../../hooks/useClasses";
import { useSubmitRequisition } from "../../hooks/useRequisitions"; // 👈 নতুন হুক ইমপোর্ট করা হলো

export default function BatchWorkspace({
  batch = null,
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
  isAutoScheduling,
}) {
  // Modal States
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState(null);
  const [classToComplete, setClassToComplete] = useState(null);
  const [requisitionClass, setRequisitionClass] = useState(null);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  // 🚀 Mutations
  const updateMutation = useUpdateClassAttendance(batch?._id);
  const saveClassReport = updateMutation?.mutateAsync || (async () => console.warn("Hook not implemented"));
  
  const submitRequisitionMutation = useSubmitRequisition(); // 👈 রিকুইজিশনের হুক ইনিশিয়ালাইজ

  // Keyboard Shortcuts
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsSliderOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // --- UI Handlers ---
  const handleOpenAttendance = (cls) => {
    setSelectedAttendanceClass(cls);
    setViewTab("attendance");
  };

  const handleBackToDaily = () => {
    setSelectedAttendanceClass(null);
    setViewTab("daily");
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewTab("daily");
    setIsSliderOpen(true);
  };

  // --- Form Submit Handlers ---
  
  // ১. Attendance & Class Completion (আগের লজিক)
  const handleSaveReport = async (classId, payload) => {
    try {
      await saveClassReport({ classId, payload });
    } catch (error) {
      console.error("Failed to save report:", error);
      throw error; 
    }
  };

  // ২. 🚀 Requisition/Bazar List Submit (নতুন লজিক)
  const handleRequisitionSubmit = async (classId, payload) => {
    try {
      await submitRequisitionMutation.mutateAsync({
        class_content: classId,
        batch: batch._id,
        branch: batch.branch?._id || batch.branch,
        ...payload // এর ভেতরে items এবং budget থাকবে
      });
      setRequisitionClass(null); // সফল হলে মডাল বন্ধ হবে
    } catch (error) {
      console.error("Requisition Error:", error);
      throw error;
    }
  };

  if (!batch || !batch._id) {
    return <div className="flex-1 flex items-center justify-center h-full min-h-[400px]"><Loader /></div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 relative animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 1. TOP HEADER SECTION */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 px-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {batch?.batch_name || "Loading..."}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded-md">
                {batch?.batch_type}
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <CalendarDays size={14} className="text-slate-400" />
                {batch?.schedule_days?.join(", ")}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          
          {/* Class Content Builder Button */}
          <button
            onClick={() => setIsCurriculumModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all whitespace-nowrap"
          >
            <LayoutGrid size={16} /> Class Content
          </button>

          {/* View Syllabus Button */}
          <button
            onClick={onShowSyllabus}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-all whitespace-nowrap"
          >
            <FileText size={16} className="text-indigo-500" /> View All
          </button>

          {/* Auto Schedule Button */}
          {allClasses.some((c) => !c.date_scheduled) && (
            <button
              onClick={() => autoSchedule()}
              disabled={isAutoScheduling}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Sparkles size={16} className={isAutoScheduling ? "animate-spin" : ""} /> Auto-Schedule
            </button>
          )}

          {/* Agenda Slider Trigger */}
          <button
            onClick={() => setIsSliderOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all whitespace-nowrap"
          >
            <PanelRightOpen size={16} /> Agenda
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. MAIN CALENDAR AREA */}
      {/* ========================================== */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        <ClassCalendar
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          selectedDate={selectedDate}
          setSelectedDate={handleDateSelect}
          allClasses={allClasses}
          setViewTab={setViewTab}
        />
      </div>

      {/* ========================================== */}
      {/* 3. SLIDE-OUT DRAWER (AGENDA) */}
      {/* ========================================== */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isSliderOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSliderOpen(false)}
      />

      <aside 
        className={`fixed top-0 right-0 h-[100dvh] w-full sm:w-[440px] bg-[#f8fafc] shadow-2xl border-l border-slate-200 z-[70] transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isSliderOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {viewTab === 'attendance' ? 'Class Attendance' : 'Schedule Overview'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </p>
          </div>
          <button 
            onClick={() => setIsSliderOpen(false)} 
            className="p-2 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-rose-500 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0">
              <ClassSidebar
                viewTab={viewTab}
                setViewTab={setViewTab}
                authUser={authUser}
                allClasses={allClasses} 
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
                onMarkComplete={(cls) => setClassToComplete(cls)}
                onOpenRequisition={(cls) => setRequisitionClass(cls)}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 4. MODALS AREA */}
      {/* ========================================== */}
      
      {/* ক্লাস কন্টেন্ট বিল্ডার মডাল (Import/Manual) */}
      {isCurriculumModalOpen && (
        <CurriculumBuilderModal 
          batch={batch} 
          courseId={batch.course?._id || batch.course} 
          onClose={() => setIsCurriculumModalOpen(false)} 
        />
      )}

      {/* ক্লাস কমপ্লিট / অ্যাটেন্ডেন্স মডাল */}
      <MarkClassCompleteModal
        isOpen={!!classToComplete}
        onClose={() => setClassToComplete(null)}
        classData={classToComplete}
        batchData={batch}
        onSave={handleSaveReport} // 👈 Attendance API Call
      />

      {/* 🚀 বাজার রিকুইজিশন মডাল */}
      <ClassRequisitionModal
        isOpen={!!requisitionClass}
        onClose={() => setRequisitionClass(null)}
        classData={requisitionClass}
        onSave={handleRequisitionSubmit} // 👈 Requisition API Call
      />
    </div>
  );
}