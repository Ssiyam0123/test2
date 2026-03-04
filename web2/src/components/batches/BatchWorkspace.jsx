import React, { useState, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { ArrowLeft, LayoutGrid, Calendar as CalendarIcon, Sparkles, ClipboardCheck } from "lucide-react";

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

export default function BatchWorkspace({ 
  batch, allClasses, currentDate, setCurrentDate, 
  selectedDate, setSelectedDate, onBack, 
  autoSchedule, isAutoScheduling 
}) {
  const { hasPermission } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);

  // Modal States
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [classToComplete, setClassToComplete] = useState(null);
  const [requisitionClass, setRequisitionClass] = useState(null);

  const updateMutation = useUpdateClassAttendance(batch?._id);
  const submitReqMutation = useSubmitRequisition();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedClass(null); 
  };

  const dayClasses = useMemo(() => {
    return allClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate));
  }, [allClasses, selectedDate]);

  if (!batch) return <Loader />;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden font-sans">
      
      {/* 🟢 TOP CONTROL BAR */}
      <header className="shrink-0 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 shadow-sm transition-all group">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 bg-teal-500 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">BATCH CONTROL</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{batch.course?.course_name}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight italic uppercase">{batch.batch_name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission("manage_classes") && (
            <>
              <button onClick={() => setIsCurriculumOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-slate-900/10">
                <LayoutGrid size={14} /> Curriculum Builder
              </button>
              <button onClick={() => autoSchedule()} disabled={isAutoScheduling} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-50 transition-all">
                <Sparkles size={14} className={isAutoScheduling ? "animate-spin" : ""} /> {isAutoScheduling ? "Processing..." : "Auto Schedule"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* 🟢 SCROLLABLE WORKSPACE AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pb-10">
        
        {/* SECTION 1: CALENDAR (Fixed Height) */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden">
          <ClassCalendar
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleDateChange}
            allClasses={allClasses}
          />
        </section>

        {/* SECTION 2: AGENDA & DETAILS SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
          
          {/* LEFT: DAY AGENDA */}
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 px-2 mb-4">
                <CalendarIcon size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Agenda for {format(selectedDate, "MMM dd")}</h3>
             </div>
             <DayAgendaPanel 
                classes={dayClasses} 
                selectedClass={selectedClass} 
                onSelectClass={setSelectedClass} 
                date={selectedDate}
             />
          </div>

          {/* RIGHT: CLASS OPERATIONS & REQUISITION HISTORY */}
          <div className="lg:col-span-2">
             <div className="flex items-center gap-2 px-2 mb-4">
                <ClipboardCheck size={16} className="text-teal-500" />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Operations & Requisitions</h3>
             </div>
             <ClassDetailsPanel 
                cls={selectedClass} 
                hasPermission={hasPermission} 
                onMarkAttendance={() => setClassToComplete(selectedClass)}
                onOpenRequisition={() => setRequisitionClass(selectedClass)}
             />
          </div>

        </div>
      </div>

      {/* 🚀 MODALS LAYER */}
      {isCurriculumOpen && <CurriculumBuilderModal batch={batch} onClose={() => setIsCurriculumOpen(false)} />}
      
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