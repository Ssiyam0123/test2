import React from "react";
import { format } from "date-fns";
import { 
  Clock, 
  CalendarClock, 
  Edit2, 
  Trash2, 
  Users, 
  ShoppingBag, 
  ArrowLeft,
  Plus,
  Check,
  CalendarDays,
  Loader2,
  XCircle
} from "lucide-react";
import ClassAttendance from "./ClassAttendance";

// ==========================================
// 1. TIMELINE ITEM: DAILY CLASS (Smart Requisition Status)
// ==========================================
const TimelineClassItem = ({ cls, canManageClasses, canRequestBazar, actions }) => {
  const { onQuickSchedule, onEditClass, onDeleteClass, onOpenRequisition, onOpenAttendance } = actions;
  const isCompleted = cls.is_completed;

  // 🚀 SMART REQUISITION STATUS LOGIC
  const reqStatus = cls.requisition_status || "none"; 

  const getReqStatusUI = () => {
    switch (reqStatus) {
      case "pending":
        return {
          icon: <Loader2 size={12} className="animate-spin" />, 
          text: "Req. Pending",
          style: "bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100",
          disabled: false // Pending অবস্থায় ক্লিক করে আবার এডিট করা যাবে
        };
      case "fulfilled":
        return {
          icon: <Check size={12} strokeWidth={3} />,
          text: "Bazar Approved",
          style: "bg-emerald-50 border border-emerald-200 text-emerald-600 cursor-default opacity-90",
          disabled: true // Approve হয়ে গেলে আর এডিট করা যাবে না
        };
      case "rejected":
        return {
          icon: <XCircle size={12} strokeWidth={2} />,
          text: "Req. Rejected",
          style: "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100",
          disabled: false // রিজেক্ট হলে আবার নতুন করে রিকোয়েস্ট করতে পারবে
        };
      default:
        return {
          icon: <ShoppingBag size={12} />,
          text: canRequestBazar ? "Request Bazar" : "Log Bazar",
          style: "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm",
          disabled: false
        };
    }
  };

  const reqUI = getReqStatusUI();

  return (
    <div className="relative pl-6 py-4 border-b border-slate-100 last:border-0 group">
      {/* Timeline Vertical Line & Dot */}
      <div className="absolute left-[9px] top-0 bottom-0 w-[2px] bg-slate-100 group-last:bg-transparent"></div>
      <div className={`absolute left-1.5 top-5 w-4 h-4 rounded-full border-[3px] border-white z-10 shadow-sm ${
        isCompleted ? "bg-indigo-500" : "bg-slate-300"
      }`}></div>

      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Class {cls.class_number}
          </span>
          {isCompleted && (
            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
              <Check size={10} /> Done
            </span>
          )}
        </div>

        {/* Hover Actions (Edit/Delete) */}
        {canManageClasses && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onQuickSchedule(cls)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors" title="Quick Schedule"><CalendarClock size={14}/></button>
            <button onClick={() => onEditClass(cls)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors" title="Edit Class"><Edit2 size={14}/></button>
            <button onClick={() => onDeleteClass(cls._id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete Class"><Trash2 size={14}/></button>
          </div>
        )}
      </div>

      <h4 className={`text-sm font-semibold mb-2 pr-4 ${isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
        {cls.topic}
      </h4>

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-3">
        {cls.date_scheduled && (
          <span className="flex items-center gap-1">
            <CalendarDays size={12} className="text-slate-400"/>
            {format(new Date(cls.date_scheduled), "MMM dd, yyyy")}
          </span>
        )}
        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
        <span>{cls.class_type || "Lecture"}</span>
      </div>

      {/* Primary Actions (Pill style) */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <button 
          onClick={() => onOpenAttendance(cls)} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
            isCompleted 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
          }`}
        >
          <Users size={12} /> {isCompleted ? "View Roster" : "Attendance"}
        </button>

        {/* 🚀 DYNAMIC REQUISITION BUTTON */}
        <button 
          onClick={() => !reqUI.disabled && onOpenRequisition(cls)} 
          disabled={reqUI.disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${reqUI.style}`}
        >
          {reqUI.icon} {reqUI.text}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. COMPACT LIST ITEM: PENDING CLASS
// ==========================================
const CompactPendingItem = ({ cls, canManageClasses, actions }) => {
  const { onEditClass, onDeleteClass, onScheduleClass } = actions;

  return (
    <div className="group flex items-center justify-between p-3 mb-2 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Number Box */}
        <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold font-mono">
          {cls.class_number}
        </div>
        
        <div className="min-w-0 pr-2">
          <h4 className="text-sm font-semibold text-slate-700 truncate">{cls.topic}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] uppercase tracking-widest text-amber-500 font-bold">Unscheduled</span>
            {canManageClasses && (
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEditClass(cls)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={12}/></button>
                <button onClick={() => onDeleteClass(cls._id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={12}/></button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {canManageClasses && (
        <button 
          onClick={() => onScheduleClass(cls)} 
          className="shrink-0 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
        >
          Schedule
        </button>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT: CLASS SIDEBAR
// ==========================================
export default function ClassSidebar({
  viewTab,
  setViewTab,
  authUser,
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

  // Role & Permissions Check
  const permissions = authUser?.role?.permissions || authUser?.permissions || [];
  const roleName = (typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name || "").toLowerCase();
  
  const isMaster = roleName === "superadmin" || permissions.includes("all_access");
  const canManageClasses = isMaster || permissions.includes("manage_classes");
  const canRequestBazar = isMaster || ["superadmin", "admin", "instructor"].includes(roleName) || permissions.includes("request_bazar");

  // Action Objects for easy passing
  const dailyActions = { onQuickSchedule, onEditClass, onDeleteClass, onOpenRequisition, onOpenAttendance };
  const pendingActions = { onEditClass, onDeleteClass, onScheduleClass };

  // ==========================================
  // VIEW: ATTENDANCE & ROSTER
  // ==========================================
  if (viewTab === "attendance" && selectedAttendanceClass) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-full overflow-y-auto custom-scrollbar flex flex-col">
        <button 
          onClick={onBackToDaily} 
          className="w-fit mb-5 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Class Timeline
        </button>
        <ClassAttendance classData={selectedAttendanceClass} students={batchStudent} />
      </div>
    );
  }

  const currentTab = viewTab === "bazar" ? "daily" : viewTab;

  return (
    <div className="bg-white rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 h-full flex flex-col min-h-0">
      
      {/* SLEEK UNDERLINE TABS */}
      <div className="flex items-center px-6 pt-4 border-b border-slate-100 shrink-0">
        <button
          onClick={() => setViewTab("daily")}
          className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative top-[1px] ${
            currentTab === "daily" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Timeline ({classesOnSelectedDate?.length || 0})
        </button>
        <button
          onClick={() => setViewTab("pending")}
          className={`ml-6 pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative top-[1px] ${
            currentTab === "pending" 
              ? "border-slate-800 text-slate-800" 
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Pending ({pendingClasses?.length || 0})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        
        {/* ========================================== */}
        {/* VIEW: DAILY TIMELINE */}
        {/* ========================================== */}
        {currentTab === "daily" && (
          <div className="relative">
            {classesOnSelectedDate?.length > 0 ? (
              classesOnSelectedDate.map((cls) => (
                <TimelineClassItem 
                  key={cls._id} 
                  cls={cls} 
                  canManageClasses={canManageClasses} 
                  canRequestBazar={canRequestBazar} 
                  actions={dailyActions} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <Clock size={32} strokeWidth={1.5} className="text-slate-200 mb-4" />
                <p className="text-sm font-medium text-slate-500">No classes mapped for this date.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* VIEW: PENDING / UNSCHEDULED */}
        {/* ========================================== */}
        {currentTab === "pending" && (
          <div>
            {pendingClasses?.length > 0 ? (
              pendingClasses.map((cls) => (
                <CompactPendingItem 
                  key={cls._id} 
                  cls={cls} 
                  canManageClasses={canManageClasses} 
                  actions={pendingActions} 
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <Check size={32} strokeWidth={1.5} className="text-emerald-300 mb-4" />
                <p className="text-sm font-medium text-slate-500">All classes have been scheduled.</p>
              </div>
            )}
            
            {/* Create New Topic Button */}
            {canManageClasses && (
              <button 
                onClick={onAddClass} 
                className="w-full mt-4 py-3 bg-slate-50 border border-dashed border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Create New Topic
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}