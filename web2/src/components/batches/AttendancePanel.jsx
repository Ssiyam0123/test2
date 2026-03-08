import React, { useState, useEffect, useMemo } from "react";
import { Check, X, Save, UserX, Loader2 } from "lucide-react";
import Avatar from "../../components/common/Avatar";
import { useUpdateClassAttendance } from "../../hooks/useClasses"; // 🚀 Ensure correct hook import
import toast from "react-hot-toast";

const AttendancePanel = ({ selectedClass, batchStudents }) => {
  const [attendanceState, setAttendanceState] = useState({});
  
  // 🚀 Fetch mutation hook
  const { mutate: updateAttendance, isPending: isSaving } = useUpdateClassAttendance();

  useEffect(() => {
    if (selectedClass) {
      const initialState = {};
      // Initialize with existing records or default to null
      batchStudents.forEach(student => {
        const existing = selectedClass.attendance?.find(a => 
          (a.student?._id || a.student) === student._id
        );
        initialState[student._id] = existing ? existing.status : null;
      });
      setAttendanceState(initialState);
    }
  }, [selectedClass, batchStudents]);

  const markAttendance = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status 
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass?._id) {
      return toast.error("Class ID is missing.");
    }

    // 🚀 MATCHES BACKEND ZOD: List of { student, status }
    const attendanceRecords = Object.entries(attendanceState)
      .filter(([_, status]) => status !== null)
      .map(([studentId, status]) => ({
        student: studentId,
        status: status // Strictly "Present" or "Absent"
      }));

    const batchId = selectedClass.batch?._id || selectedClass.batch;

    // 🚀 EXACT MATCH FOR REACT QUERY HOOK: { classId, batchId, payload }
    updateAttendance({ 
      classId: selectedClass._id, 
      batchId: batchId,
      payload: {
        attendanceRecords,
        is_completed: selectedClass.is_completed // Keep status sync
      }
    }, {
      onSuccess: () => toast.success("Records updated successfully!")
    });
  };

  const validStudents = useMemo(() => 
    Array.isArray(batchStudents) ? batchStudents.filter(s => s && s._id) : []
  , [batchStudents]);

  if (validStudents.length === 0) {
    return (
      <div className="p-10 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
        <UserX className="mx-auto mb-3 opacity-20" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No students enrolled.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-20 p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Class Roster</h3>
          <p className="text-[10px] font-bold text-teal-600 truncate uppercase tracking-widest">#{selectedClass.class_number} • {selectedClass.topic}</p>
        </div>
        <span className="shrink-0 text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-lg">
          {validStudents.length} TOTAL
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {validStudents.map((student) => {
          const status = attendanceState[student._id];

          return (
            <div 
              key={student._id} 
              onClick={() => markAttendance(student._id, 'Present')}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${
                status === 'Present' ? 'border-teal-200 bg-teal-50/50 shadow-sm' : 
                status === 'Absent' ? 'border-rose-200 bg-rose-50/50 shadow-sm' : 
                'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={student.photo_url} fallbackText={student.student_name} size="sm" />
                <div className="leading-tight">
                  <p className={`text-xs font-bold ${status === 'Absent' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {student.student_name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{student.student_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-100 shadow-inner" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => markAttendance(student._id, 'Present')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'Present' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-200 hover:text-teal-500'}`}
                >
                  <Check size={14} strokeWidth={4} />
                </button>
                <button
                  onClick={() => markAttendance(student._id, 'Absent')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'Absent' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-200 hover:text-rose-500'}`}
                >
                  <X size={14} strokeWidth={4} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving}
          className="w-full py-4 bg-slate-900 hover:bg-teal-600 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl active:scale-95"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Syncing Database..." : "Save Daily Records"}
        </button>
      </div>
    </div>
  );
};

export default AttendancePanel;