import React from "react";
import { CheckCircle, ShoppingBag, UserCheck, AlertCircle, FileText } from "lucide-react";
import useAuth from "../../store/useAuth";
import { PERMISSIONS } from "../../config/permissionConfig";

export default function ClassDetailsPanel({ cls, onMarkAttendance, onOpenRequisition }) {
  const { hasPermission } = useAuth();

  // 🚀 গ্র্যানুলার পারমিশন ফ্ল্যাগস
  const canSendRequisition = hasPermission(PERMISSIONS.SEND_REQUISITION);
  const canTakeAttendance = hasPermission(PERMISSIONS.TAKE_ATTENDANCE);

  if (!cls) return (
    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
      <AlertCircle size={24} className="mx-auto text-slate-300 mb-2" />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select a class to view details</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">Class {cls.class_number}</span>
          <span className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest ${cls.is_completed ? "bg-emerald-100 text-emerald-600" : "bg-teal-100 text-teal-600"}`}>
            {cls.is_completed ? "Completed" : "Scheduled"}
          </span>
        </div>
        <h2 className="text-lg font-black text-slate-800 leading-tight mb-4">{cls.topic}</h2>
        
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><FileText size={12} /> Syllabus Details</h3>
          {cls.content_details?.length > 0 ? (
            <ul className="space-y-2">
              {cls.content_details.map((item, i) => (
                <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 shrink-0" /> 
                  {item}
                </li>
              ))}
            </ul>
          ) : <p className="text-xs font-medium text-slate-400 italic">No additional details recorded.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 🚀 রিকুইজিশন বাটন: পারমিশন প্রটেক্টড */}
        {canSendRequisition && (
          <button onClick={onOpenRequisition} className="p-4 bg-white border-2 border-slate-100 rounded-3xl flex flex-col items-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-all group shadow-sm">
            <ShoppingBag size={20} className="text-slate-300 group-hover:text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Requisition</span>
          </button>
        )}

        {/* 🚀 এটেনডেন্স বাটন: পারমিশন প্রটেক্টড */}
        {canTakeAttendance && (
          <button onClick={onMarkAttendance} className={`p-4 rounded-3xl flex flex-col items-center gap-2 transition-all shadow-lg ${cls.is_completed ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-100/50" : "bg-teal-600 text-white shadow-teal-100 hover:bg-teal-700"}`}>
            {cls.is_completed ? <CheckCircle size={20} /> : <UserCheck size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{cls.is_completed ? "Update Report" : "Attendance"}</span>
          </button>
        )}
      </div>
    </div>
  );
}