import React from "react";
import { CheckCircle, ShoppingBag, UserCheck, AlertCircle, FileText, Palmtree } from "lucide-react";

export default function ClassDetailsPanel({ cls, hasPermission, onMarkAttendance, onOpenRequisition }) {
  
  if (!cls) {
    return (
      <div className="h-full min-h-[200px] flex items-center justify-center text-center p-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <div>
          <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-teal-200" />
          </div>
          <p className="text-sm font-bold text-gray-400">Select a class from the agenda to view details and take actions.</p>
        </div>
      </div>
    );
  }

  // If the selected item is a holiday
  if (cls.isHoliday) {
    return (
      <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 rounded-3xl border border-rose-100">
        <Palmtree size={48} className="text-rose-200 mb-4" />
        <h2 className="text-xl font-black text-rose-900 uppercase tracking-tight">{cls.topic}</h2>
        <p className="text-sm font-bold text-rose-400 mt-2">Institute is closed. No actions can be performed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm h-full flex flex-col overflow-hidden">
      
      {/* 🟢 HEADER */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">Class {cls.class_number}</span>
          <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">{cls.class_type}</span>
        </div>
        <h2 className="text-xl font-black text-gray-800 leading-tight">{cls.topic}</h2>
      </div>

      {/* 🟢 BODY (Content & Details) */}
      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FileText size={14} /> Topics Covered
        </h3>
        
        {cls.content_details && cls.content_details.length > 0 ? (
          <ul className="space-y-3">
            {cls.content_details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span className="text-sm font-bold text-gray-600 leading-relaxed">{detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-bold text-gray-400 italic">No specific topics listed for this class.</p>
        )}
      </div>

      {/* 🟢 FOOTER (Action Buttons) */}
      <div className="p-5 bg-white border-t border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Requisition Button - Always show if hasPermission */}
          {hasPermission("manage_classes") && (
            <button 
              onClick={onOpenRequisition}
              className="flex-1 py-3.5 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <ShoppingBag size={16} /> 
              Requisition
            </button>
          )}

          {/* Attendance Button - Always show if hasPermission */}
          {hasPermission("take_attendance") && (
            <button 
              onClick={onMarkAttendance}
              className={`flex-1 py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                cls.is_completed 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100" 
                  : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20"
              }`}
            >
              {cls.is_completed ? <CheckCircle size={16} /> : <UserCheck size={16} />}
              {cls.is_completed ? "Update Report" : "Take Attendance"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}