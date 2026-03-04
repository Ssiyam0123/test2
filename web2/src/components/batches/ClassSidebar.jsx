import React from "react";
import { format } from "date-fns";
import { 
  Check, Clock, Plus, Loader2, ShoppingBag, 
  Trash2, Edit2, CalendarClock, Users, ArrowLeft 
} from "lucide-react";
import useAuth from "../../store/useAuth";

const TimelineItem = ({ cls, actions }) => {
  const { hasPermission } = useAuth();
  const isDone = cls.is_completed;
  
  return (
    <div className="relative pl-10 pb-10 group last:pb-4">
      {/* 🛠 Connector Line */}
      <div className="absolute left-[13px] top-3 bottom-0 w-[2.5px] bg-slate-100 group-last:hidden"></div>
      
      {/* 🛠 Status Dot */}
      <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-4 border-white shadow-md z-10 transition-all duration-500 ${isDone ? 'bg-teal-500 scale-110' : 'bg-slate-200'}`}>
        {isDone && <Check size={14} className="text-white m-auto mt-1" strokeWidth={4} />}
      </div>

      <div className={`p-6 rounded-[2rem] border transition-all duration-300 ${isDone ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/5'}`}>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg">
            Class {cls.class_number}
          </span>
          
          <div className="flex items-center gap-1.5">
             {cls.requisition_status === 'pending' && <Loader2 size={14} className="text-amber-500 animate-spin" />}
             {cls.requisition_status === 'fulfilled' && <ShoppingBag size={14} className="text-teal-500" />}
             
             {hasPermission("manage_classes") && !isDone && (
               <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => actions.onEditClass(cls)} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors"><Edit2 size={12}/></button>
                  <button onClick={() => actions.onDeleteClass(cls._id)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={12}/></button>
               </div>
             )}
          </div>
        </div>

        <h4 className={`text-[15px] font-bold leading-tight mb-4 ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {cls.topic}
        </h4>
        
        <div className="flex items-center gap-2">
           {!isDone ? (
             <>
               <button 
                 onClick={() => actions.onMarkComplete(cls)} 
                 className="flex-1 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
               >
                 Start Session
               </button>
               <button 
                 onClick={() => actions.onOpenRequisition(cls)} 
                 className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all"
                 title="Requisition"
               >
                 <ShoppingBag size={18} />
               </button>
             </>
           ) : (
             <button onClick={() => actions.onOpenAttendance(cls)} className="w-full py-2 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg">
                View Performance
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default function ClassSidebar({ viewTab, setViewTab, classesOnSelectedDate, pendingClasses, onMarkComplete, onOpenRequisition, onEditClass, onDeleteClass, onOpenAttendance, onBackToDaily }) {
  const isPendingView = viewTab === "pending";

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe]">
      {/* 🚀 TAB SWITCHER */}
      <div className="flex p-2 bg-slate-100/50 m-6 rounded-2xl border border-slate-200/60 shrink-0">
        <button onClick={() => setViewTab("daily")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isPendingView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          Today's Timeline
        </button>
        <button onClick={() => setViewTab("pending")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isPendingView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
          Unscheduled ({pendingClasses?.length})
        </button>
      </div>

      {/* 🚀 SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-10">
        {!isPendingView ? (
          classesOnSelectedDate?.length > 0 ? (
            classesOnSelectedDate.map(cls => <TimelineItem key={cls._id} cls={cls} actions={{ onMarkComplete, onOpenRequisition, onEditClass, onDeleteClass, onOpenAttendance }} />)
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
               <Clock size={48} className="text-slate-200 mb-4" strokeWidth={1} />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No classes scheduled</p>
            </div>
          )
        ) : (
           pendingClasses.map(cls => (
             <div key={cls._id} className="p-4 bg-white border border-slate-200 rounded-2xl mb-3 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-700 truncate mr-4">{cls.topic}</span>
                <button className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Schedule</button>
             </div>
           ))
        )}
      </div>
    </div>
  );
}