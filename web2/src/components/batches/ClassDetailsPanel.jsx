import React from "react";
import { ShoppingBag, Users, Info, ArrowRight } from "lucide-react";

export default function ClassDetailsPanel({ cls, hasPermission }) {
  if (!cls) return (
    <div className="h-full bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-10">
      <Info size={48} className="mb-4 opacity-10" />
      <p className="text-xs font-black uppercase tracking-widest text-center">Select a class from the agenda<br/>to start operations</p>
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm animate-in zoom-in-95 duration-300 h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10 pb-8 border-b border-slate-50">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{cls.topic}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            REFERENCE ID: <span className="text-slate-800">#{cls._id.slice(-8)}</span>
          </p>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${cls.is_completed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
           {cls.is_completed ? 'Session Finalized' : 'Session Ready'}
        </div>
      </div>

      {/* REQUISITION LIST */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-teal-600">
           <ShoppingBag size={20} />
           <h4 className="text-xs font-black uppercase tracking-widest">Bazar & Tool Requisition</h4>
        </div>
        
        {cls.requisitions?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {cls.requisitions.map((req, idx) => (
               <div key={idx} className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-700">{req.name}</span>
                  <span className="font-black text-teal-600">x{req.qty} {req.unit || 'pcs'}</span>
               </div>
             ))}
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-3xl text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center italic">No items requested for this topic.</div>
        )}
      </div>

      {/* CTA BUTTONS */}
      <div className="mt-12 pt-10 border-t border-slate-50 flex flex-wrap gap-4">
        {hasPermission("take_attendance") && (
          <button className="flex-1 min-w-[200px] flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
            <Users size={18} /> Mark Session Attendance
          </button>
        )}
        <button className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all group">
          Log Materials <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}