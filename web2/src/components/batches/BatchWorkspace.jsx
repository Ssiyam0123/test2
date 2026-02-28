import React, { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Plus,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import ClassCalendar from "./ClassCalendar";
import ClassSidebar from "./ClassSidebar";
import Loader from "../../components/Loader";

import CostSummaryWidget from "../costs/CostSummaryWidget";
import MarkClassCompleteModal from "./MarkClassCompleteModal";
import { useUpdateClassAttendance } from "../../hooks/useClasses";
import ClassRequisitionModal from "./ClassRequisitionModal";

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
  const [selectedAttendanceClass, setSelectedAttendanceClass] = useState(null);
  const [mobileView, setMobileView] = useState("calendar");
  const [classToComplete, setClassToComplete] = useState(null);
  const [requisitionClass, setRequisitionClass] = useState(null);

  const updateMutation = useUpdateClassAttendance(batch?._id);
  const saveClassReport =
    updateMutation?.mutateAsync ||
    (async () => console.warn("Hook not implemented yet"));

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
    if (window.innerWidth < 1024) {
      setMobileView("list");
    }
  };

  const handleSaveReport = async (classId, payload) => {
    try {
      await saveClassReport({ classId, payload });
    } catch (error) {
      console.error("Failed to save report:", error);
      throw error; 
    }
  };

  if (!batch || !batch._id) {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-[400px]">
        <Loader />
      </div>
    );
  }

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
            <h2 className="text-xl font-black text-gray-800 truncate">
              {batch?.batch_name || "Loading..."}
            </h2>
            <p className="text-xs text-teal-600 font-bold uppercase tracking-tight">
              {batch?.batch_type} • {batch?.schedule_days?.join(", ")}
            </p>
          </div>
        </div>

        {/* Mobile View Switcher */}
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

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onShowSyllabus}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
            title="View Syllabus"
          >
            <FileText size={18} className="text-teal-500" />
          </button>
          {allClasses.some((c) => !c.date_scheduled) && (
            <button
              onClick={() => autoSchedule()}
              disabled={isAutoScheduling}
              className="px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles
                size={18}
                className={isAutoScheduling ? "animate-spin" : ""}
              />{" "}
              Auto-Schedule
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* Calendar View */}
        <div
          className={`${mobileView === "list" ? "hidden lg:block" : "block"} h-full overflow-y-auto custom-scrollbar`}
        >
          <ClassCalendar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleDateSelect}
            allClasses={allClasses}
            setViewTab={setViewTab}
          />
        </div>

        {/* Sidebar View */}
        <div
          className={`${mobileView === "calendar" ? "hidden lg:flex" : "flex"} flex-col h-full min-h-0 gap-4`}
        >
          {/* FINANCIAL WIDGET PLACEMENT */}
          <div className="shrink-0">
            <CostSummaryWidget entityId={batch?._id} entityType="batch" />
          </div>

          {/* Daily Class List Sidebar */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ClassSidebar
              viewTab={viewTab}
              setViewTab={setViewTab}
              authUser={authUser}
              allClasses={allClasses} // <-- ADDED THIS PROP
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

      {/* Mobile Floating Action Button */}
      {mobileView === "list" &&
        ["admin", "registrar"].includes(authUser?.role) && (
          <button
            onClick={onAddClass}
            className="lg:hidden fixed bottom-6 right-6 p-4 bg-teal-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50"
          >
            <Plus size={24} />
          </button>
        )}

      {/* MODALS */}
      <MarkClassCompleteModal
        isOpen={!!classToComplete}
        onClose={() => setClassToComplete(null)}
        classData={classToComplete}
        batchData={batch}
        onSave={handleSaveReport}
      />

      <ClassRequisitionModal
        isOpen={!!requisitionClass}
        onClose={() => setRequisitionClass(null)}
        classData={requisitionClass}
        onSave={handleSaveReport}
      />
    </div>
  );
}