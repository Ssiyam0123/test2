// src/pages/batches/ManageBatches.jsx
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isSameDay, isAfter, startOfToday } from "date-fns";
import { Layers } from "lucide-react";

// Hooks & Store
import { useActiveBatches, useBatchClasses, useAutoSchedule, useDeleteClass } from "../../hooks/useBatches";
import useAuth from "../../store/useAuth";

// Components
import BatchHeader from "../../components/batches/BatchHeader";
import BatchWorkspace from "../../components/batches/BatchWorkspace";
import AddClassModal from "../../components/batches/AddClassModal";
import AddSyllabusModal from "../../components/batches/AddSyllabusModal";
import EditSyllabusModal from "../../components/modal/EditSyllabusModal"; 
import ViewSyllabusModal from "../../components/batches/ViewSyllabusModal";
import QuickScheduleModal from "../../components/batches/QuickScheduleModal";
import Loader from "../../components/Loader";

export default function ManageBatches() {
  const { id: batchId } = useParams(); // Reads the :id from the URL
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  // Shared States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewTab, setViewTab] = useState("daily");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewSyllabusOpen, setIsViewSyllabusOpen] = useState(false);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  
  const [editingClass, setEditingClass] = useState(null);
  const [classToSchedule, setClassToSchedule] = useState(null);
  
  // Fetch ALL active batches (for the pill navigation tabs)
  const { data: batchesResponse } = useActiveBatches();
  const batches = batchesResponse?.data || [];
  
  // Find the exact batch we are viewing
  const selectedBatch = useMemo(() => {
    return batches.find(b => b._id === batchId) || null;
  }, [batches, batchId]);

  // Fetch Classes for Workbench
  const { data: classesResponse, isLoading: isClassesLoading } = useBatchClasses(batchId);
  const allBatchClasses = classesResponse?.data || [];
  
  const { mutate: autoSchedule, isPending: isAutoScheduling } = useAutoSchedule(batchId);
  const { mutate: deleteClass } = useDeleteClass(batchId);

  // Derived Logic
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

          {/* Horizontal Pill Tabs for easy switching between workbenches */}
          <div className="mb-6 w-full overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-1.5 bg-slate-100/60 p-1.5 rounded-[1.25rem] w-fit min-w-full sm:min-w-0 border border-slate-200/60">
              {batches.map((batch) => {
                const isActive = batch._id === batchId;
                return (
                  <button
                    key={batch._id}
                    onClick={() => navigate(`/admin/batches/${batch._id}`)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all duration-300
                      ${isActive ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'}
                    `}
                  >
                    <Layers size={16} className={`${isActive ? 'text-teal-500' : 'text-slate-400 opacity-70'} transition-colors`} />
                    {batch.batch_name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workbench Calendar Area */}
          {isClassesLoading ? (
            <div className="flex-1 flex items-center justify-center"><Loader /></div>
          ) : (
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
              onBack={() => navigate('/admin/manage-batches')} // Goes back to cards!
              onShowSyllabus={() => setIsViewSyllabusOpen(true)}
              onAddClass={() => setIsSyllabusModalOpen(true)}
              onScheduleClass={() => setIsModalOpen(true)}
              onQuickSchedule={(cls) => { setClassToSchedule(cls); setIsQuickScheduleOpen(true); }}
              onEditClass={(cls) => { setEditingClass(cls); setIsEditModalOpen(true); }}
              onDeleteClass={handleDelete}
              autoSchedule={autoSchedule} 
              isAutoScheduling={isAutoScheduling}
            />
          )}

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