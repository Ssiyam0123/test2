import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Clock, Users, ListPlus, Edit2 } from "lucide-react";

export default function BatchList({ batches, authUser, onSelectBatch }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Active Batches</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and track batch progress.</p>
        </div>
        
        {['admin', 'registrar'].includes(authUser?.role) && (
          <button 
            onClick={() => navigate('/admin/add-batch')} 
            className="w-full sm:w-auto px-5 py-3 bg-[#1e293b] text-white text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={18} /> Create New Batch
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {batches.map(batch => (
            <div 
              key={batch._id} 
              onClick={() => onSelectBatch(batch)}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all cursor-pointer group relative flex flex-col justify-between"
            >
              {['admin', 'registrar'].includes(authUser?.role) && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/edit-batch/${batch._id}`);
                  }}
                  className="absolute top-4 right-4 p-2.5 bg-gray-50 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
              )}

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight truncate">{batch.batch_name}</h3>
                    <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">{batch.course?.course_name}</p>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 mb-2">
                    <Clock size={14} className="text-teal-500" />
                    <span>{batch.time_slot?.start_time} — {batch.time_slot?.end_time}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {batch.schedule_days?.map(day => (
                      <span key={day} className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-black text-slate-500 rounded-md">
                        {day.substring(0, 3).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                    <ListPlus size={14} className="text-teal-500"/> {batch.class_contents?.length || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                    <Users size={14} className="text-blue-500"/> {batch.students?.length || 0}
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                  batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {batch.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}