import React from "react";
import { format } from "date-fns";
import { Edit3, Trash2, CalendarDays, Plus, CalendarClock, Users, ArrowLeft, CheckCircle2 } from "lucide-react";
import AttendancePanel from "./AttendancePanel"; 

export default function ClassSidebar({ 
  viewTab, setViewTab, authUser, classesOnSelectedDate, pendingClasses, 
  onEditClass, onDeleteClass, onAddClass, onScheduleClass, onQuickSchedule, 
  batchStudent,
  selectedAttendanceClass, onOpenAttendance, onBackToDaily
}) {
  const displayClasses = viewTab === "daily" ? classesOnSelectedDate : pendingClasses;
  const totalBatchStudents = batchStudent?.length || 0;

  if (viewTab === "attendance" && selectedAttendanceClass) {
    return (
      <div className="flex flex-col gap-4 md:gap-6 h-full min-h-0">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-white flex-1 flex flex-col min-h-0 relative">
          <button 
            onClick={onBackToDaily}
            className="absolute top-3 left-3 md:top-4 md:left-4 p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors z-10"
          >
            <ArrowLeft size={18} />
          </button>
          <AttendancePanel 
            selectedClass={selectedAttendanceClass} 
            batchStudents={batchStudent} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full min-h-0">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm border border-white flex-1 flex flex-col min-h-0">
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 shrink-0">
          <button 
            className={`flex-1 text-[10px] md:text-[11px] font-black py-2.5 rounded-lg transition-all ${viewTab === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} 
            onClick={() => setViewTab("daily")}
          >
            DAILY ({classesOnSelectedDate.length})
          </button>
          <button 
            className={`flex-1 text-[10px] md:text-[11px] font-black py-2.5 rounded-lg transition-all ${viewTab === 'unscheduled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} 
            onClick={() => setViewTab("unscheduled")}
          >
            PENDING ({pendingClasses.length})
          </button>
        </div>

        {/* Classes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar md:pr-2 space-y-3">
          {displayClasses.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10 font-medium italic">No classes found.</div>
          ) : (
            displayClasses.map(cls => {
              const hasAttendance = cls.attendance && cls.attendance.length > 0;
              const presentCount = hasAttendance 
                ? cls.attendance.filter(a => a.status === 'present').length 
                : 0;

              return (
                <div key={cls._id} className="group p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm relative hover:border-teal-100 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-[#1e293b] text-white text-[8px] md:text-[9px] font-black rounded uppercase">
                      Class {cls.class_number}
                    </span>
                    
                    {/* FIXED: Icons now visible on mobile by default, hover-only on desktop */}
                    <div className="flex gap-0.5 md:gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onQuickSchedule(cls)} 
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <CalendarClock size={16} className="md:w-3.5 md:h-3.5"/>
                      </button>
                      <button 
                        onClick={() => onEditClass(cls)} 
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={16} className="md:w-3.5 md:h-3.5"/>
                      </button>
                      <button 
                        onClick={() => onDeleteClass(cls._id)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="md:w-3.5 md:h-3.5"/>
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-gray-800 leading-tight mb-3 flex-1">
                    {cls.topic}
                  </h4>
                  
                  <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-teal-600 uppercase mb-0.5">
                        {cls.class_type}
                      </p>
                      {cls.date_scheduled && (
                        <span className="text-[9px] text-gray-400 font-bold tracking-tighter">
                          {format(new Date(cls.date_scheduled), "dd MMM, yyyy")}
                        </span>
                      )}
                    </div>

                    {/* Attendance Section */}
                    {cls.date_scheduled && viewTab === 'daily' && (
                      <div className="flex items-center gap-1.5 md:gap-2">
                        {hasAttendance && (
                          <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md border border-teal-100">
                            <CheckCircle2 size={10} className="text-teal-500" />
                            <span className="text-[9px] md:text-[10px] font-bold">{presentCount}/{totalBatchStudents}</span>
                          </div>
                        )}
                        <button
                          onClick={() => onOpenAttendance(cls)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg transition-colors text-[10px] md:text-xs font-bold ${
                            hasAttendance 
                              ? 'bg-gray-100 text-gray-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          <Users size={12} />
                          {hasAttendance ? "Edit" : "Attendance"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Schedule Button */}
        {['admin', 'registrar'].includes(authUser?.role) && (
          <button 
            onClick={() => viewTab === 'daily' ? onScheduleClass() : onAddClass()}
            className={`mt-4 w-full py-3 md:py-3.5 text-white text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${
              viewTab === 'daily' ? 'bg-teal-500 active:bg-teal-600' : 'bg-slate-800 active:bg-slate-900'
            }`}
          >
            {viewTab === 'daily' ? <CalendarDays size={18} /> : <Plus size={18} />}
            {viewTab === 'daily' ? "Schedule Topic" : "Add Class"}
          </button>
        )}
      </div>
    </div>
  );
}