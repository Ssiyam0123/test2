import React from "react";
import { format } from "date-fns";
import { Edit3, Trash2, CalendarDays, Plus, CalendarClock, Users, ArrowLeft } from "lucide-react";
import AttendancePanel from "./AttendancePanel"; // Ensure you import this!

export default function ClassSidebar({ 
  viewTab, setViewTab, authUser, classesOnSelectedDate, pendingClasses, 
  onEditClass, onDeleteClass, onAddClass, onScheduleClass, onQuickSchedule, 
  batchStudent, // This contains the array of students passed from Workspace
  selectedAttendanceClass, onOpenAttendance, onBackToDaily // NEW PROPS
}) {
  const displayClasses = viewTab === "daily" ? classesOnSelectedDate : pendingClasses;

  // ==========================================
  // RENDER ATTENDANCE VIEW
  // ==========================================
  if (viewTab === "attendance" && selectedAttendanceClass) {
    return (
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-white flex-1 flex flex-col min-h-0 relative">
          
          {/* Back Button Overlay */}
          <button 
            onClick={onBackToDaily}
            className="absolute top-4 left-4 p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors z-10"
            title="Back to Daily View"
          >
            <ArrowLeft size={16} />
          </button>

          <AttendancePanel 
            selectedClass={selectedAttendanceClass} 
            batchStudents={batchStudent} 
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER STANDARD LIST VIEW (Daily/Pending)
  // ==========================================
  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-white flex-1 flex flex-col min-h-0">
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 shrink-0">
          <button className={`flex-1 text-[11px] font-black py-2 rounded-lg transition-all ${viewTab === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} onClick={() => setViewTab("daily")}>
            DAILY ({classesOnSelectedDate.length})
          </button>
          <button className={`flex-1 text-[11px] font-black py-2 rounded-lg transition-all ${viewTab === 'unscheduled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`} onClick={() => setViewTab("unscheduled")}>
            PENDING ({pendingClasses.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {displayClasses.length === 0 ? (
            <div className="text-center text-gray-400 text-sm mt-10 font-medium">No classes found.</div>
          ) : (
            displayClasses.map(cls => (
              <div key={cls._id} className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative hover:border-teal-100 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 bg-[#1e293b] text-white text-[9px] font-black rounded uppercase">Class {cls.class_number}</span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Quick Schedule Button */}
                    <button 
                      onClick={() => onQuickSchedule(cls)} 
                      title={cls.date_scheduled ? "Reschedule" : "Schedule Class"}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <CalendarClock size={14}/>
                    </button>
                    <button onClick={() => onEditClass(cls)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                      <Edit3 size={14}/>
                    </button>
                    <button onClick={() => onDeleteClass(cls._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-gray-800 leading-tight mb-3 flex-1">{cls.topic}</h4>
                
                {/* UPDATED: Grouped Class Type/Date and Attendance button together */}
                <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-teal-600 uppercase mb-0.5">{cls.class_type}</p>
                    {cls.date_scheduled && (
                      <span className="text-[9px] text-gray-400 font-bold tracking-tighter">
                        {format(new Date(cls.date_scheduled), "dd MMM, yyyy")}
                      </span>
                    )}
                  </div>

                  {/* NEW: Attendance Button (Only shows if class is scheduled and in daily view) */}
                  {cls.date_scheduled && viewTab === 'daily' && (
                    <button
                      onClick={() => onOpenAttendance(cls)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-xs font-bold"
                    >
                      <Users size={12} />
                      Attendance
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        {['admin', 'registrar'].includes(authUser?.role) && (
          <button 
            onClick={() => viewTab === 'daily' ? onScheduleClass() : onAddClass()}
            className={`mt-4 w-full py-3.5 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${viewTab === 'daily' ? 'bg-[#14b8a6] hover:bg-teal-600' : 'bg-[#1e293b] hover:bg-slate-800'}`}
          >
            {viewTab === 'daily' ? <CalendarDays size={18} /> : <Plus size={18} />}
            {viewTab === 'daily' ? "Schedule Topic" : "Add Class"}
          </button>
        )}
      </div>
    </div>
  );
}