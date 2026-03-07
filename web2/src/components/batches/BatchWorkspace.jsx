import React, { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import {
  ArrowLeft,
  LayoutGrid,
  Calendar as CalendarIcon,
  Sparkles,
  ClipboardCheck,
  X,
} from "lucide-react"; // 🚀 Added 'X' icon

// Components
import ClassCalendar from "./ClassCalendar";
import DayAgendaPanel from "./DayAgendaPanel";
import ClassDetailsPanel from "./ClassDetailsPanel";
import CurriculumBuilderModal from "./CurriculumBuilderModal";
import MarkClassCompleteModal from "./MarkClassCompleteModal";
import ClassRequisitionModal from "./ClassRequisitionModal";
import Loader from "../../components/Loader";

// Hooks
import useAuth from "../../store/useAuth";
import { useUpdateClassAttendance } from "../../hooks/useClasses";
import { useSubmitRequisition } from "../../hooks/useRequisitions";
import { useHolidays } from "../../hooks/useHolidays";
import { useEffect } from "react";

export default function BatchWorkspace({
  batch,
  allClasses = [],
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  onBack,
  autoSchedule,
  isAutoScheduling,
}) {
  const { hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);

  // 🚀 SLIDE SIDEBAR STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal States
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [classToComplete, setClassToComplete] = useState(null);
  const [requisitionClass, setRequisitionClass] = useState(null);

  const updateMutation = useUpdateClassAttendance(batch?._id);
  const submitReqMutation = useSubmitRequisition();

  const canManageCurriculum = hasPermission("manage_curriculum");
  const canUseAutoScheduler = hasPermission("use_auto_scheduler");

  // Fetch Holidays
  const { data: holidaysRes } = useHolidays();
  const holidays = useMemo(() => {
    const data =
      holidaysRes?.data?.data || holidaysRes?.data || holidaysRes || [];
    return Array.isArray(data) ? data : [];
  }, [holidaysRes]);

  // Merge Classes & Holidays
  const combinedClasses = useMemo(() => {
    const classesArray = Array.isArray(allClasses) ? allClasses : [];
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    let holidayEvents = [];

    holidays.forEach((h) => {
      if (h.date_string?.length === 5) {
        [currentYear, nextYear].forEach((year) => {
          holidayEvents.push({
            _id: `hol-${h._id}-${year}`,
            topic: `🏖️ ${h.title}`,
            date_scheduled: `${year}-${h.date_string}`,
            isHoliday: true,
            class_type: "Holiday",
          });
        });
      } else {
        holidayEvents.push({
          _id: `hol-${h._id}`,
          topic: `🏖️ ${h.title}`,
          date_scheduled: h.date_string,
          isHoliday: true,
          class_type: "Holiday",
        });
      }
    });

    return [...classesArray, ...holidayEvents];
  }, [allClasses, holidays]);

  // 🚀 DATE CLICK HANDLER (Opens Sidebar)
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedClass(null);
    setIsSidebarOpen(true); // Open the drawer
  };

  useEffect(() => {
    if (selectedClass && allClasses?.length > 0) {
      // Find the fresh version of the currently selected class
      const freshClassData = allClasses.find(c => c._id === selectedClass._id);
      
      // If there is new data, update the local state instantly
      if (freshClassData && JSON.stringify(freshClassData) !== JSON.stringify(selectedClass)) {
        setSelectedClass(freshClassData);
      }
    }
  }, [allClasses, selectedClass]);

  const dayClasses = useMemo(() => {
    if (!Array.isArray(combinedClasses)) return [];
    return combinedClasses.filter(
      (c) =>
        c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate),
    );
  }, [combinedClasses, selectedDate]);

  if (!batch) return <Loader />;

  return (
    <div className="fixed inset-0 w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      {/* 🟢 TOP CONTROL BAR */}
      <header className="shrink-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-4 md:p-6 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-200 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 bg-teal-500 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">
                BATCH WORKSPACE
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                {batch.course?.course_name}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic uppercase leading-none">
              {batch.batch_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageCurriculum && (
            <button
              onClick={() => setIsCurriculumOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            >
              <LayoutGrid size={14} /> Curriculum Builder
            </button>
          )}
          {canUseAutoScheduler && (
            <button
              onClick={() => autoSchedule()}
              disabled={isAutoScheduling}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-50 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles
                size={14}
                className={isAutoScheduling ? "animate-spin" : ""}
              />{" "}
              {isAutoScheduling ? "Processing..." : "Auto Schedule"}
            </button>
          )}
        </div>
      </header>

      {/* 🟢 FULL SCREEN CALENDAR */}
      <main className="flex-1 flex p-4 md:p-6 overflow-hidden min-h-0 relative">
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col min-h-0 transition-all">
          <ClassCalendar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            allClasses={combinedClasses}
          />
        </div>

        {/* 🚀 SLIDE-OUT SIDEBAR OVERLAY */}
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* 🚀 SLIDE-OUT SIDEBAR PANEL */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-[#f8fafc] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 bg-white border-b border-slate-200 shrink-0">
            <div>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">
                Date Details
              </p>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {format(selectedDate, "EEEE, MMM dd")}
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2.5 bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* 🚀 Sidebar Body - Added pb-6 to ensure bottom padding so nothing cuts off */}
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-hidden min-h-0 pb-8">
            {/* 🟢 Agenda Container (Takes all remaining space: flex-1) */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-slate-50">
                <CalendarIcon size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                  Daily Agenda
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <DayAgendaPanel
                  classes={dayClasses}
                  selectedClass={selectedClass}
                  onSelectClass={setSelectedClass}
                  date={selectedDate}
                />
              </div>
            </div>

            {/* 🟢 Operations Container (Takes exact content height: shrink-0, but max 55%) */}
            <div className="shrink-0 max-h-[55%] bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-slate-50">
                <ClipboardCheck size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                  Operations
                </h3>
              </div>
              {/* Added overflow-hidden here so the inner ClassDetailsPanel can scroll its own content */}
              <div className="flex-1 min-h-0 overflow-hidden p-2">
                <ClassDetailsPanel
                  cls={selectedClass}
                  hasPermission={hasPermission}
                  onMarkAttendance={
                    selectedClass?.isHoliday
                      ? null
                      : () => setClassToComplete(selectedClass)
                  }
                  onOpenRequisition={
                    selectedClass?.isHoliday
                      ? null
                      : () => setRequisitionClass(selectedClass)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      {isCurriculumOpen && (
        <CurriculumBuilderModal
          batch={batch}
          onClose={() => setIsCurriculumOpen(false)}
        />
      )}
      <MarkClassCompleteModal
        isOpen={!!classToComplete}
        onClose={() => setClassToComplete(null)}
        classData={classToComplete}
        batchData={batch}
        onSave={updateMutation.mutateAsync}
      />
      <ClassRequisitionModal
        isOpen={!!requisitionClass}
        onClose={() => setRequisitionClass(null)}
        classData={requisitionClass}
        batchData={batch}
        onSave={submitReqMutation.mutateAsync}
      />
    </div>
  );
}
