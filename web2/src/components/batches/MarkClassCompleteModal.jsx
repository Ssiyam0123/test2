import React, { useState, useEffect, useMemo } from "react";
import { X, Check, XCircle, Users, Loader2, CheckSquare, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function MarkClassCompleteModal({ 
  isOpen, onClose, classData, batchData, onSave 
}) {
  const [attendance, setAttendance] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && batchData?.students) {
      const initialAttendance = {};
      batchData.students.forEach(student => {
        const existingRecord = classData?.attendance?.find(a => 
          (a.student?._id || a.student) === student._id
        );
        
        // 🚀 Matches Backend Zod Enum ("Present", "Absent")
        let defaultStatus = "Present";
        if (existingRecord && existingRecord.status) {
          const s = existingRecord.status;
          defaultStatus = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        }
        
        initialAttendance[student._id] = defaultStatus;
      });
      setAttendance(initialAttendance);
    }
  }, [isOpen, batchData, classData]);

  const presentCount = useMemo(() => Object.values(attendance).filter(s => s === "Present").length, [attendance]);

  if (!isOpen) return null;

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({ 
      ...prev, 
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present" 
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    batchData.students.forEach(s => allPresent[s._id] = "Present");
    setAttendance(allPresent);
  };

  const handleSubmit = async () => {
    if (!classData?._id) {
      return toast.error("Missing class information.");
    }

    setIsSubmitting(true);
    
    // 🚀 PERFECT ZOD MATCH
    const formattedRecords = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      status: status 
    }));

    try {
      await onSave({
        classId: classData._id,
        batchId: batchData._id, // 🚀 ADDED: Required for React Query to invalidate cache!
        payload: {
          attendanceRecords: formattedRecords, 
          is_completed: true
        }
      });
      
      toast.success("Attendance successfully updated!");
      onClose();
    } catch (error) {
      console.error("Failed to save attendance:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to update attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Class {classData?.class_number}</span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Attendance Roster</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{classData?.topic}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={16} /></div>
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{presentCount} / {batchData?.students?.length || 0} Present</span>
            </div>
            <button onClick={markAllPresent} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <CheckSquare size={14} /> Mark All Present
            </button>
          </div>

          <div className="space-y-2">
            {batchData?.students?.length > 0 ? (
              batchData.students.map((student) => {
                const isPresent = attendance[student._id] === "Present";
                return (
                  <div key={student._id} onClick={() => toggleAttendance(student._id)} className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] ${isPresent ? "bg-white border-slate-200 shadow-sm" : "bg-rose-50/50 border-rose-100 opacity-75"}`}>
                    <div className="flex items-center gap-3">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt="student" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                          {student.student_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-bold ${isPresent ? "text-slate-800" : "text-slate-500 line-through decoration-slate-300"}`}>{student.student_name}</p>
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{student.student_id}</p>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isPresent ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-rose-100 text-rose-500"}`}>
                      {isPresent ? <Check size={16} strokeWidth={3} /> : <XCircle size={16} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-2xl">
                No students enrolled in this batch.
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-4 bg-slate-100 text-slate-600 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting || !batchData?.students?.length} className="flex-1 py-4 bg-teal-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-teal-600/20">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isSubmitting ? "Saving..." : "Submit Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}