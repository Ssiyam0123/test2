import React from "react";
import { X, Edit3, Trash2, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

export default function ViewSyllabusModal({ classes, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-black text-gray-800">Batch Curriculum</h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">
              Total {classes.length} Classes Registered
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content - Table View */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">
                <th className="pb-2 pl-4">ID</th>
                <th className="pb-2">Topic & Details</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Scheduled Date</th>
                <th className="pb-2 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls._id} className="bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                  <td className="py-4 pl-4 rounded-l-2xl">
                    <span className="px-2 py-1 bg-[#1e293b] text-white text-[10px] font-black rounded uppercase">
                      {cls.class_number}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="font-bold text-gray-800 text-sm">{cls.topic}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{cls.content_details?.join(", ")}</div>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-black text-teal-600 uppercase bg-teal-50 px-2 py-1 rounded-md">
                      {cls.class_type}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                      <Calendar size={14} className="text-gray-300" />
                      {cls.date_scheduled ? format(new Date(cls.date_scheduled), "PPP") : "Not Scheduled"}
                    </div>
                  </td>
                  <td className="py-4 text-right pr-4 rounded-r-2xl">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(cls)}
                        className="p-2 text-teal-600 hover:bg-teal-100 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(cls._id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {classes.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <FileText size={48} className="mx-auto mb-2" />
              <p className="font-black uppercase text-sm tracking-widest">No classes found in syllabus</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}