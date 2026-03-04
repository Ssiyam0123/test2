import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isSameDay, isAfter, startOfToday } from "date-fns";
import { Layers, CalendarDays, ClipboardCheck } from "lucide-react"; // Imported new icons

// Hooks & Store
import { useBatches} from "../../hooks/useBatches";
import {  useBatchClasses, useAutoSchedule, useDeleteClass } from "../../hooks/useClasses";
import useAuth from "../../store/useAuth";

// Components
import BatchHeader from "../../components/batches/BatchHeader";
import BatchWorkspace from "../../components/batches/BatchWorkspace";
import AttendanceBook from "../../pages/batches/AttendanceBook"; // IMPORT THE NEW ATTENDANCE BOOK
import AddClassModal from "../../components/batches/AddClassModal";
import AddSyllabusModal from "../../components/batches/AddSyllabusModal";
import EditSyllabusModal from "../../components/modal/EditSyllabusModal"; 
import ViewSyllabusModal from "../../components/batches/ViewSyllabusModal";
import QuickScheduleModal from "../../components/batches/QuickScheduleModal";
import Loader from "../../components/Loader";

export default function ManageBatches() {
  const { id: batchId } = useParams(); 
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  // Shared States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewTab, setViewTab] = useState("daily");
  
  // NEW: Toggle between Calendar Workspace and Attendance Matrix
  const [activeView, setActiveView] = useState("schedule"); // 'schedule' | 'attendance'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewSyllabusOpen, setIsViewSyllabusOpen] = useState(false);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  
  const [editingClass, setEditingClass] = useState(null);
  const [classToSchedule, setClassToSchedule] = useState(null);
  
  const { data: batchesResponse } = useBatches();
  const batches = batchesResponse?.data || [];
  
  const selectedBatch = useMemo(() => {
    return batches.find(b => b._id === batchId) || null;
  }, [batches, batchId]);

  const { data: classesResponse, isLoading: isClassesLoading } = useBatchClasses(batchId);
  const allBatchClasses = classesResponse?.data || [];
  
  const { mutate: autoSchedule, isPending: isAutoScheduling } = useAutoSchedule(batchId);
  const { mutate: deleteClass } = useDeleteClass(batchId);

  const pendingClasses = useMemo(() => {
    return allBatchClasses.filter(c => 
      !c.date_scheduled || isAfter(new Date(c.date_scheduled), startOfToday())
    );
  }, [allBatchClasses]);

  const classesOnSelectedDate = useMemo(() => {
    return allBatchClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate));
  }, [selectedDate, allBatchClasses]);

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to remove this class?")) {
      deleteClass(id);
    }
  };

  if (!selectedBatch && batches.length > 0) return <div className="p-8 text-center text-slate-500">Batch not found.</div>;

  return (
    <div className="min-h-screen bg-[#e8f0f2] p-2 md:p-4 lg:p-8 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] flex gap-4 lg:gap-6 h-[calc(100dvh-1rem)] lg:h-[85vh]">
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[1.25rem] md:rounded-[2.5rem] p-3 md:p-6 shadow-sm border border-white/60 overflow-hidden">
          
          <BatchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} authUser={authUser} />

          {/* TOP CONTROLS: Batch Selector & View Toggle */}
        

          {/* MAIN WORKSPACE AREA */}
          <div className="flex-1 overflow-hidden flex flex-col relative">
            {isClassesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center"><Loader /></div>
            ) : activeView === "schedule" ? (
              // ---------------- SCHEDULE VIEW ----------------
              <BatchWorkspace 
                batch={selectedBatch} 
                authUser={authUser} 
                allClasses={allBatchClasses} 
                pendingClasses={pendingClasses} 
                classesOnSelectedDate={classesOnSelectedDate}
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate}
                selectedDate={selectedDate} 
                setSelectedDate={setSelectedDate}
                viewTab={viewTab} 
                setViewTab={setViewTab}
                onBack={() => navigate('/admin/manage-batches')} 
                onShowSyllabus={() => setIsViewSyllabusOpen(true)}
                onAddClass={() => setIsSyllabusModalOpen(true)}
                onScheduleClass={() => setIsModalOpen(true)}
                onQuickSchedule={(cls) => { setClassToSchedule(cls); setIsQuickScheduleOpen(true); }}
                onEditClass={(cls) => { setEditingClass(cls); setIsEditModalOpen(true); }}
                onDeleteClass={handleDelete}
                autoSchedule={autoSchedule} 
                isAutoScheduling={isAutoScheduling}
              />
            ) : (
              // ---------------- ATTENDANCE VIEW ----------------
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AttendanceBook batch={selectedBatch} classes={allBatchClasses} />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modals Layer */}
      {isQuickScheduleOpen && classToSchedule && (
        <QuickScheduleModal batchId={batchId} classData={classToSchedule} onClose={() => { setIsQuickScheduleOpen(false); setClassToSchedule(null); }} />
      )}
      {isViewSyllabusOpen && (
        <ViewSyllabusModal classes={allBatchClasses} onClose={() => setIsViewSyllabusOpen(false)} onEdit={(cls) => { setEditingClass(cls); setIsEditModalOpen(true); }} onDelete={handleDelete} />
      )}
      {isModalOpen && (
        <AddClassModal batchId={batchId} date={selectedDate} unscheduledClasses={pendingClasses.filter(c => !c.date_scheduled)} onClose={() => setIsModalOpen(false)} />
      )}
      {isSyllabusModalOpen && (
        <AddSyllabusModal batchId={batchId} onClose={() => setIsSyllabusModalOpen(false)} />
      )}
      {isEditModalOpen && editingClass && (
        <EditSyllabusModal batchId={batchId} classData={editingClass} onClose={() => { setIsEditModalOpen(false); setEditingClass(null); }} />
      )}
    </div>
  );
}