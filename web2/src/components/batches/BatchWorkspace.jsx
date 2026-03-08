import React, { useState, useMemo, useEffect } from "react";
import { isSameDay } from "date-fns";
import { Calendar as CalendarIcon, BookOpen, ListChecks } from "lucide-react";

// Components
import ClassCalendar from "./ClassCalendar";
import DayAgendaPanel from "./DayAgendaPanel";
import ClassDetailsPanel from "./ClassDetailsPanel";
import AttendanceBook from "../../pages/batches/AttendanceBook";
import BatchCurriculumList from "./BatchCurriculumList";

import CurriculumBuilderModal from "./CurriculumBuilderModal";
import MarkClassCompleteModal from "./MarkClassCompleteModal";
import ClassRequisitionModal from "./ClassRequisitionModal";
import QuickScheduleModal from "./QuickScheduleModal";

import useAuth from "../../store/useAuth";
import { useUpdateClassAttendance } from "../../hooks/useClasses";

export default function BatchWorkspace({
  batch,
  allClasses,
  selectedDate,
  setSelectedDate,
  currentDate,
  setCurrentDate,
  deleteClass,
  autoSchedule,
  isAutoScheduling,
}) {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("calendar");
  const [selectedClass, setSelectedClass] = useState(null);
  const [schedulingClass, setSchedulingClass] = useState(null);

  console.log(batch);

  const [modals, setModals] = useState({
    import: false,
    attendance: false,
    requisition: false,
    quick: false,
  });

  const updateMutation = useUpdateClassAttendance();

  const handleOpenClassDetails = (cls) => {
    if (cls.date_scheduled) {
      setSelectedDate(new Date(cls.date_scheduled));
      setCurrentDate(new Date(cls.date_scheduled));
    }
    setSelectedClass(cls);
  };

  const handleRescheduleTrigger = (cls) => {
    setSchedulingClass(cls);
    setModals((prev) => ({ ...prev, quick: true }));
  };

  const dayClasses = useMemo(() => {
    return allClasses.filter(
      (c) =>
        c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate),
    );
  }, [allClasses, selectedDate]);

  useEffect(() => {
    if (selectedClass) {
      const fresh = allClasses.find((c) => c._id === selectedClass._id);
      if (fresh) setSelectedClass(fresh);
    }
  }, [allClasses]);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-4 bg-slate-50 border-b border-slate-100 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "calendar" ? "bg-white text-teal-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}
          >
            <CalendarIcon size={14} /> Calendar
          </button>
          <button
            onClick={() => setActiveTab("curriculum")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "curriculum" ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}
          >
            <BookOpen size={14} /> Curriculum Matrix
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "attendance" ? "bg-white text-orange-600 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-700"}`}
          >
            <ListChecks size={14} /> Master Attendance
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative p-4">
          {activeTab === "calendar" && (
            <ClassCalendar
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              allClasses={allClasses}
            />
          )}
          {activeTab === "curriculum" && (
            <BatchCurriculumList
              batch={batch}
              classes={allClasses}
              onSelectClass={handleOpenClassDetails}
              deleteClass={deleteClass}
              autoSchedule={autoSchedule}
              isAutoScheduling={isAutoScheduling}
              openImport={() => setModals({ ...modals, import: true })}
              onReschedule={handleRescheduleTrigger}
            />
          )}
          {activeTab === "attendance" && (
            <div className="h-full overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl">
              <AttendanceBook batch={batch} classes={allClasses} />
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 h-full">
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
              <CalendarIcon size={14} className="text-teal-500" /> Daily Agenda
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
            <DayAgendaPanel
              classes={dayClasses}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              date={selectedDate}
            />
          </div>
        </div>

        <div className="shrink-0 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[250px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
              <BookOpen size={14} className="text-indigo-500" /> Operations Desk
            </h3>
          </div>
          <div className="p-4">
            <ClassDetailsPanel
              cls={selectedClass}
              hasPermission={hasPermission}
              onMarkAttendance={() =>
                setModals({ ...modals, attendance: true })
              }
              onOpenRequisition={() =>
                setModals({ ...modals, requisition: true })
              }
            />
          </div>
        </div>
      </div>

      {modals.import && (
        <CurriculumBuilderModal
          batch={batch}
          onClose={() => setModals({ ...modals, import: false })}
        />
      )}
      {modals.quick && schedulingClass && (
        <QuickScheduleModal
          batchId={batch._id}
          classData={schedulingClass}
          onClose={() => setModals({ ...modals, quick: false })}
        />
      )}
      {modals.attendance && selectedClass && (
        <MarkClassCompleteModal
          isOpen={true}
          onClose={() => setModals({ ...modals, attendance: false })}
          classData={selectedClass}
          batchData={batch}
          onSave={updateMutation.mutateAsync}
        />
      )}
      {modals.requisition && selectedClass && (
        <ClassRequisitionModal
          isOpen={true}
          onClose={() => setModals({ ...modals, requisition: false })}
          classData={selectedClass}
          batchData={batch}
        />
      )}
    </div>
  );
}
