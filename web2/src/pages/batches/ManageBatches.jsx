import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useBatchById } from "../../hooks/useBatches"; 
import { useBatchClasses, useAutoSchedule, useDeleteClass } from "../../hooks/useClasses";
import useAuth from "../../store/useAuth";

import BatchWorkspace from "../../components/batches/BatchWorkspace";
import Loader from "../../components/Loader";

export default function ManageBatches() {
  const { id: batchId } = useParams(); 
  const navigate = useNavigate();
  const { authUser } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: selectedBatch, isLoading: isBatchLoading } = useBatchById(batchId);

  const { data: classesRes, isLoading: isClassesLoading } = useBatchClasses(batchId);
  const allClasses = Array.isArray(classesRes?.data) ? classesRes.data : Array.isArray(classesRes) ? classesRes : [];
  
  const { mutate: autoSchedule, isPending: isAutoScheduling } = useAutoSchedule(batchId);
  const { mutate: deleteClass } = useDeleteClass(batchId);

  if (isClassesLoading || isBatchLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!selectedBatch) {
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Batch Not Found or Access Denied.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* 🚀 FIXED: min-h for mobile, h- for desktop */}
      <div className="max-w-[1600px] mx-auto flex flex-col min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
        
        {/* TOP BAR */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <button 
            onClick={() => navigate('/admin/manage-batches')} 
            className="p-3 bg-white rounded-2xl text-slate-400 hover:text-teal-600 shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
              {selectedBatch.batch_name}
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {selectedBatch.course?.course_name}
            </p>
          </div>
        </div>

        {/* WORKSPACE ENGINE */}
        <div className="flex-1 min-h-0">
          <BatchWorkspace 
            batch={selectedBatch} 
            allClasses={allClasses} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            deleteClass={deleteClass} 
            autoSchedule={autoSchedule} 
            isAutoScheduling={isAutoScheduling}
            authUser={authUser}
          />
        </div>

      </div>
    </div>
  );
}