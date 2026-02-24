import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Clock, Users, ListPlus } from "lucide-react";

export default function BatchList({ batches, authUser, onSelectBatch }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Batches</h1>
          <p className="text-gray-500 mt-1">Select a batch to manage classes and schedules.</p>
        </div>
        {['admin', 'registrar'].includes(authUser?.role) && (
          <button onClick={() => navigate('/admin/add-batch')} className="px-5 py-2.5 bg-[#1e293b] text-white text-sm font-bold rounded-xl shadow-lg flex items-center gap-2">
            <Plus size={18} /> Create New Batch
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {batches.map(batch => (
            <div 
              key={batch._id} 
              onClick={() => onSelectBatch(batch)}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                  <BookOpen size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{batch.batch_name}</h3>
              <p className="text-sm text-gray-500 font-medium line-clamp-1">{batch.course?.course_name}</p>

              <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-slate-500">
                <Clock size={12} className="text-teal-500" />
                <span>{batch.time_slot?.start_time} - {batch.time_slot?.end_time}</span>
                <span className="ml-2 text-slate-300">|</span>
                <span className="text-teal-600 uppercase tracking-tighter">
                  {batch.schedule_days?.map(day => day.substring(0, 3)).join(" • ")}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100/50">
                <div className="flex items-center text-xs font-bold text-gray-400 gap-4">
                  <div className="flex items-center gap-1.5"><ListPlus size={14} className="text-teal-500"/> {batch.class_contents?.length || 0} Classes</div>
                  <div className="flex items-center gap-1.5"><Users size={14} className="text-blue-500"/> {batch.students?.length || 0} Students</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}