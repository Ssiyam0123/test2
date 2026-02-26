import React from "react";
import { format } from "date-fns";
import { 
  Clock, 
  CalendarClock, 
  Edit3, 
  Trash2, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowLeft,
  Plus
} from "lucide-react";
import ClassAttendance from "./ClassAttendance";

export default function ClassSidebar({
  viewTab,
  setViewTab,
  authUser,
  allClasses = [],
  classesOnSelectedDate,
  pendingClasses,
  onEditClass,
  onDeleteClass,
  onAddClass,
  onScheduleClass,
  onQuickSchedule,
  batchStudent,
  selectedAttendanceClass,
  onOpenAttendance,
  onBackToDaily,
  onOpenRequisition
}) {

  // Role Checks
  const isInstructor = authUser?.role === "instructor";
  const isStaff = ["admin", "registrar"].includes(authUser?.role);

  // ==========================================
  // INLINE ATTENDANCE VIEW
  // ==========================================
  if (viewTab === "attendance" && selectedAttendanceClass) {
    return (
      <div className="bg-white/40 rounded-3xl p-4 md:p-6 border border-white/60 h-full overflow-y-auto custom-scrollbar flex flex-col">
        <button 
          onClick={onBackToDaily} 
          className="self-start mb-4 text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Back to Schedule
        </button>
        <ClassAttendance 
          classData={selectedAttendanceClass} 
          students={batchStudent} 
        />
      </div>
    );
  }

  // Derive scheduled classes for the Bazar feed
  const bazarClasses = allClasses
    .filter(c => c.date_scheduled)
    .sort((a, b) => new Date(b.date_scheduled) - new Date(a.date_scheduled));

  return (
    <div className="bg-white/40 rounded-[2rem] p-3 md:p-5 border border-white/60 h-full flex flex-col min-h-0">
      
      {/* 3-WAY TAB HEADER */}
      <div className="flex bg-white p-1 md:p-1.5 rounded-2xl shadow-sm border border-gray-100 mb-4 shrink-0">
        <button
          onClick={() => setViewTab("daily")}
          className={`flex-1 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            viewTab === "daily" ? "bg-teal-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Daily ({classesOnSelectedDate?.length || 0})
        </button>
        <button
          onClick={() => setViewTab("pending")}
          className={`flex-1 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            viewTab === "pending" ? "bg-amber-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Pending ({pendingClasses?.length || 0})
        </button>
        <button
          onClick={() => setViewTab("bazar")}
          className={`flex-1 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            viewTab === "bazar" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Bazar List
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 space-y-3">
        
        {/* ============================== */}
        {/* VIEW: DAILY CLASSES            */}
        {/* ============================== */}
        {viewTab === "daily" && (
          <>
            {classesOnSelectedDate?.length > 0 ? (
              classesOnSelectedDate.map((cls) => (
                <div key={cls._id} className="group p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative hover:border-teal-100 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 text-white text-[9px] font-black rounded uppercase ${cls.is_completed ? 'bg-teal-500' : 'bg-[#1e293b]'}`}>
                      Class {cls.class_number} {cls.is_completed && "✓"}
                    </span>
                    
                    {/* STAFF ONLY: Schedule / Edit / Delete */}
                    {isStaff && (
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onQuickSchedule(cls)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Quick Reschedule"><CalendarClock size={16}/></button>
                        <button onClick={() => onEditClass(cls)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg" title="Edit Details"><Edit3 size={16}/></button>
                        <button onClick={() => onDeleteClass(cls._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Class"><Trash2 size={16}/></button>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-800 leading-tight mb-3 flex-1">{cls.topic}</h4>
                  
                  <div className="flex justify-between items-end mt-auto pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black text-teal-600 uppercase mb-0.5">{cls.class_type || "Lecture"}</p>
                      {cls.date_scheduled && <span className="text-[10px] text-gray-400 font-bold tracking-tighter">{format(new Date(cls.date_scheduled), "dd MMM, yyyy")}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* ROLE-BASED REQUISITION BUTTON */}
                      <button 
                        onClick={() => onOpenRequisition(cls)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors text-xs font-bold"
                      >
                        <ShoppingBag size={12} /> 
                        {isInstructor ? "Request Bazar" : "Log Bazar Cost"}
                      </button>

                      {/* ATTENDANCE BUTTON (Opens inline) */}
                      <button 
                        onClick={() => onOpenAttendance(cls)} 
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold ${
                          cls.is_completed ? 'bg-gray-100 text-gray-600' : 'bg-teal-50 text-teal-600'
                        }`}
                      >
                        <Users size={12} /> 
                        {cls.is_completed ? "View Roster" : "Take Attendance"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">No classes scheduled</p>
              </div>
            )}
          </>
        )}

        {/* ============================== */}
        {/* VIEW: PENDING CLASSES          */}
        {/* ============================== */}
        {viewTab === "pending" && (
          <>
            {pendingClasses?.length > 0 ? (
              pendingClasses.map((cls) => (
                <div key={cls._id} className="p-3 bg-white/60 rounded-xl border border-dashed border-gray-200 hover:bg-white hover:border-amber-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Class {cls.class_number}</span>
                      
                      {/* STAFF ONLY: Edit / Delete */}
                      {isStaff && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEditClass(cls)} className="p-1 text-gray-400 hover:text-teal-600"><Edit3 size={14}/></button>
                          <button onClick={() => onDeleteClass(cls._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-[13px] font-bold text-gray-700 leading-snug mb-3">{cls.topic}</h4>
                  </div>
                  
                  {isStaff && (
                    <button onClick={() => onScheduleClass(cls)} className="w-full py-2 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-100 transition-colors">
                      Schedule Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                <p className="text-sm font-bold text-gray-500">All caught up!</p>
              </div>
            )}
            
            {isStaff && (
              <button onClick={onAddClass} className="w-full mt-2 py-3 border-2 border-dashed border-teal-200 text-teal-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-50 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Add Topic
              </button>
            )}
          </>
        )}

        {/* ============================== */}
        {/* VIEW: BAZAR LIST FEED          */}
        {/* ============================== */}
        {viewTab === "bazar" && (
          <>
            {bazarClasses?.length > 0 ? (
              bazarClasses.map((cls) => {
                const hasRequisition = !!cls.financials?.expense_notes || cls.financials?.budget > 0;
                const hasActualCost = cls.financials?.actual_cost > 0;

                return (
                  <div key={cls._id} className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                    
                    {/* Header: Class Info */}
                    <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-2">
                      <div>
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Class {cls.class_number}</span>
                        <h4 className="text-sm font-bold text-gray-800 leading-tight mt-0.5">{cls.topic}</h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">
                        {format(new Date(cls.date_scheduled), "dd MMM")}
                      </span>
                    </div>

                    {/* Body: Financial / Requisition Data */}
                    <div className="flex-1 mb-4">
                      {hasRequisition ? (
                        <div className="space-y-2">
                          {/* Items requested */}
                          {cls.financials?.expense_notes && (
                            <div className="text-xs text-gray-600 font-medium bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Requested Items:</span>
                              {cls.financials.expense_notes}
                            </div>
                          )}
                          
                          {/* Financial Breakdown */}
                          <div className="flex justify-between items-center px-1 mt-2">
                            <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Est. Budget</p>
                              <p className="text-sm font-bold text-gray-700">৳{cls.financials?.budget || 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Actual Cost</p>
                              <p className={`text-sm font-black ${hasActualCost ? "text-teal-600" : "text-amber-500"}`}>
                                ৳{cls.financials?.actual_cost || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          No bazar list requested yet.
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => onOpenRequisition(cls)} 
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                        hasActualCost 
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                    >
                      <ShoppingBag size={14} /> 
                      {hasActualCost ? "View Ledger" : (isInstructor ? "Update Request" : "Log Final Cost")}
                    </button>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                <DollarSign size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">No scheduled classes to track</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}