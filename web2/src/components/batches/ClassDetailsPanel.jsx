import React from "react";
import { ShoppingBag, Users, Info, ArrowRight, CheckCircle2, Loader2, XCircle, History, Calculator } from "lucide-react";
import { format } from "date-fns";

export default function ClassDetailsPanel({ cls, hasPermission, onMarkAttendance, onOpenRequisition }) {
  if (!cls) return (
    <div className="h-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-10">
      <Info size={48} className="mb-4 opacity-10" />
      <p className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">Select a class from the agenda<br/>to start workspace operations</p>
    </div>
  );

  const reqStatus = cls.requisition_status || "none";
  // Assuming cls.requisitions is the active list of items
  const activeItems = cls.requisitions || [];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm animate-in zoom-in-95 duration-300 h-full flex flex-col overflow-hidden">
      
      {/* 🛠 CLASS HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b border-slate-50 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-black text-teal-600 uppercase">Class-0{cls.class_number}</span>
             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{cls._id.slice(-6)}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{cls.topic}</h2>
        </div>
        
        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
          cls.is_completed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
           {cls.is_completed ? 'Session Finalized' : 'Upcoming Session'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
        
        {/* 📋 SECTION 1: REQUISITION ITEMS */}
        <div>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-slate-800">
                <ShoppingBag size={18} className="text-teal-500" />
                <h4 className="font-black text-xs uppercase tracking-widest">Bazar List / Ingredients</h4>
             </div>
             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 ${
                reqStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                reqStatus === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-400'
             }`}>
                {reqStatus === 'pending' && <Loader2 size={10} className="animate-spin" />}
                {reqStatus === 'fulfilled' && <CheckCircle2 size={10} />}
                {reqStatus === 'none' ? "Not Requested" : reqStatus}
             </span>
          </div>

          {activeItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-teal-200 transition-all">
                  <span className="text-sm font-bold text-slate-700 capitalize">{item.item_name}</span>
                  <span className="text-sm font-black text-teal-600">x{item.quantity} <span className="text-[10px] opacity-60 uppercase">{item.unit}</span></span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl text-center">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No items listed for this class yet.</p>
            </div>
          )}
        </div>

        {/* 📊 SECTION 2: FINANCE & HISTORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
           {/* Budget Summary */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Calculator size={18} className="text-teal-500" />
                <h4 className="font-black text-xs uppercase tracking-widest">Financial Summary</h4>
              </div>
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Budget</p>
                 <h3 className="text-2xl font-black">৳{cls.financials?.budget || 0}</h3>
                 <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-slate-400">Actual Spent</span>
                    <span className="text-sm font-black text-teal-400">৳{cls.financials?.actual_cost || 0}</span>
                 </div>
              </div>
           </div>

           {/* Log / History */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <History size={18} className="text-teal-500" />
                <h4 className="font-black text-xs uppercase tracking-widest">Status History</h4>
              </div>
              <div className="space-y-3">
                 <div className="flex items-start gap-3 pl-2 relative">
                    <div className="absolute left-[-1px] top-4 bottom-0 w-[1px] bg-slate-100"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                    <div>
                       <p className="text-xs font-bold text-slate-700">Topic Created</p>
                       <p className="text-[10px] text-slate-400 font-medium">Automatic system log</p>
                    </div>
                 </div>
                 {cls.date_scheduled && (
                    <div className="flex items-start gap-3 pl-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                       <div>
                          <p className="text-xs font-bold text-slate-700">Date Scheduled</p>
                          <p className="text-[10px] text-slate-400 font-medium">{format(new Date(cls.date_scheduled), "PPP")}</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* 🛠 BOTTOM ACTIONS */}
      <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-4 shrink-0">
        {hasPermission("take_attendance") && (
          <button 
            onClick={onMarkAttendance}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Users size={18} /> {cls.is_completed ? "Update Attendance" : "Session Finalization"}
          </button>
        )}
        
        <button 
          onClick={onOpenRequisition}
          className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all group"
        >
          {reqStatus === 'fulfilled' ? "View bazar List" : "Request items"} 
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}