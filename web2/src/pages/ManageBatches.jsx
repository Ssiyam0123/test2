import React, { useState, useMemo } from "react";
import { isSameDay, isAfter, startOfToday } from "date-fns";

// Hooks & Store
import { useActiveBatches, useBatchClasses, useAutoSchedule, useDeleteClass } from "../hooks/useBatches";
import useAuth from "../store/useAuth";

// Components
import BatchHeader from "../components/batches/BatchHeader";
import BatchList from "../components/batches/BatchList";
import BatchWorkspace from "../components/batches/BatchWorkspace";
import AddClassModal from "../components/batches/AddClassModal";
import AddSyllabusModal from "../components/batches/AddSyllabusModal";
import EditSyllabusModal from "../components/modal/EditSyllabusModal"; 
import ViewSyllabusModal from "../components/batches/ViewSyllabusModal";
import QuickScheduleModal from "../components/batches/QuickScheduleModal";

export default function ManageBatches() {
  const { authUser } = useAuth();
  
  // Shared States
  const [selectedBatch, setSelectedBatch] = useState(null);
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
  
  // React Query Hooks
  const { data: batchesResponse, isLoading: batchesLoading } = useActiveBatches();
  const batches = batchesResponse?.data || [];
  
  const { data: classesResponse } = useBatchClasses(selectedBatch?._id);
  const allBatchClasses = classesResponse?.data || [];
  
  const { mutate: autoSchedule, isPending: isAutoScheduling } = useAutoSchedule(selectedBatch?._id);
  const { mutate: deleteClass } = useDeleteClass(selectedBatch?._id);

  // Derived Logic
  const pendingClasses = useMemo(() => {
    return allBatchClasses.filter(c => 
      !c.date_scheduled || isAfter(new Date(c.date_scheduled), startOfToday())
    );
  }, [allBatchClasses]);

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.course?.course_name && b.course.course_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const classesOnSelectedDate = useMemo(() => {
    return allBatchClasses.filter(c => c.date_scheduled && isSameDay(new Date(c.date_scheduled), selectedDate));
  }, [selectedDate, allBatchClasses]);

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to remove this class?")) {
      deleteClass(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f0f2] p-4 lg:p-8 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] flex gap-6 h-[85vh]">
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/60 overflow-hidden">
          
          <BatchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} authUser={authUser} />

          {!selectedBatch ? (
            <BatchList batches={filteredBatches} authUser={authUser} onSelectBatch={setSelectedBatch} />
          ) : (
            <BatchWorkspace 
              batch={selectedBatch} authUser={authUser} 
              allClasses={allBatchClasses} pendingClasses={pendingClasses} classesOnSelectedDate={classesOnSelectedDate}
              currentDate={currentDate} setCurrentDate={setCurrentDate}
              selectedDate={selectedDate} setSelectedDate={setSelectedDate}
              viewTab={viewTab} setViewTab={setViewTab}
              onBack={() => setSelectedBatch(null)}
              onShowSyllabus={() => setIsViewSyllabusOpen(true)}
              onAddClass={() => setIsSyllabusModalOpen(true)}
              onScheduleClass={() => setIsModalOpen(true)}
              onQuickSchedule={(cls) => { setClassToSchedule(cls); setIsQuickScheduleOpen(true); }}
              onEditClass={(cls) => { setEditingClass(cls); setIsEditModalOpen(true); }}
              onDeleteClass={handleDelete}
              autoSchedule={autoSchedule} isAutoScheduling={isAutoScheduling}
            />
          )}

        </div>
      </div>

      {/* Modals Layer */}
      {isQuickScheduleOpen && selectedBatch && classToSchedule && (
        <QuickScheduleModal 
          batchId={selectedBatch._id}
          classData={classToSchedule}
          onClose={() => { setIsQuickScheduleOpen(false); setClassToSchedule(null); }}
        />
      )}

      {isViewSyllabusOpen && selectedBatch && (
        <ViewSyllabusModal 
          classes={allBatchClasses} onClose={() => setIsViewSyllabusOpen(false)}
          onEdit={(cls) => { setEditingClass(cls); setIsEditModalOpen(true); }} onDelete={handleDelete}
        />
      )}
      
      {isModalOpen && selectedBatch && (
        <AddClassModal batchId={selectedBatch._id} date={selectedDate} unscheduledClasses={pendingClasses.filter(c => !c.date_scheduled)} onClose={() => setIsModalOpen(false)} />
      )}
      
      {isSyllabusModalOpen && selectedBatch && (
        <AddSyllabusModal batchId={selectedBatch._id} onClose={() => setIsSyllabusModalOpen(false)} />
      )}
      
      {isEditModalOpen && selectedBatch && (
        <EditSyllabusModal batchId={selectedBatch._id} classData={editingClass} onClose={() => { setIsEditModalOpen(false); setEditingClass(null); }} />
      )}
    </div>
  );
}