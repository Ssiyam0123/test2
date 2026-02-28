import React, { useState, useEffect, useMemo } from "react";
import { Check, XCircle, Users, CheckSquare, Loader2 } from "lucide-react";
import { useUpdateClassAttendance } from "../../hooks/useClasses";

export default function ClassAttendance({ classData, students = [] }) {
  const [attendance, setAttendance] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grab the mutation hook. We safely extract the batch ID so React Query knows which cache to update
  const batchId = classData?.batch?._id || classData?.batch;
  const updateMutation = useUpdateClassAttendance(batchId);
  const saveClassReport = updateMutation?.mutateAsync || (async () => console.warn("Hook not implemented"));

  // Initialize attendance state when the component mounts
  useEffect(() => {
    if (students?.length > 0) {
      const initialAttendance = {};
      students.forEach(student => {
        // Check if this student already has a recorded status for this class
        const existingRecord = classData?.attendance?.find(
          a => a.student === student._id || a.student?._id === student._id
        );
        // Default to 'present' if no record exists yet
        initialAttendance[student._id] = existingRecord ? existingRecord.status : "present";
      });
      setAttendance(initialAttendance);
    }
  }, [classData, students]);

  const presentCount = useMemo(() => 
    Object.values(attendance).filter(s => s === "present").length, 
  [attendance]);

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present"
    }));
  };

  const markAllPresent = () => {
    const allPresent = {};
    students.forEach(s => allPresent[s._id] = "present");
    setAttendance(allPresent);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Format the attendance object into the array the backend expects
    const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      status
    }));

    const payload = {
      is_completed: true, // Marking attendance completes the academic portion
      attendanceRecords,
      financials: classData?.financials // Preserve any existing financials!
    };

    try {
      await saveClassReport({ classId: classData._id, payload });
      // The hook will automatically trigger the success toast and invalidate the cache!
    } catch (error) {
      console.error("Failed to save attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* HEADER SECTION */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[9px] font-black uppercase tracking-widest rounded">
            Class {classData?.class_number}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Roster
          </span>
        </div>
        <h3 className="text-lg font-black text-gray-800 leading-tight">
          {classData?.topic}
        </h3>
      </div>

      {/* STATS & QUICK ACTIONS */}
      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={14} />
          </div>
          <span className="text-xs font-black text-gray-700 uppercase tracking-widest">
            {presentCount} / {students.length} Present
          </span>
        </div>
        <button 
          onClick={markAllPresent}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <CheckSquare size={12} /> Mark All
        </button>
      </div>

      {/* STUDENT LIST (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 pb-4">
        {students?.length > 0 ? (
          students.map((student) => {
            const isPresent = attendance[student._id] === "present";
            return (
              <div 
                key={student._id} 
                onClick={() => toggleAttendance(student._id)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                  isPresent 
                    ? "bg-white border-gray-200 shadow-sm" 
                    : "bg-rose-50/50 border-rose-100 opacity-80"
                }`}
              >
                <div className="flex items-center gap-3">
                  {student.photo_url ? (
                    <img 
                      src={student.photo_url} 
                      alt="student" 
                      className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                      {student.student_name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className={`text-xs font-bold transition-colors ${
                      isPresent ? "text-gray-800" : "text-gray-500 line-through decoration-gray-300"
                    }`}>
                      {student.student_name}
                    </p>
                    <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mt-0.5">
                      {student.student_id}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                  isPresent 
                    ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                    : "bg-rose-100 text-rose-500"
                }`}>
                  {isPresent ? <Check size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No students enrolled in this batch.
          </div>
        )}
      </div>

      {/* STICKY FOOTER ACTION */}
      <div className="pt-3 border-t border-gray-100 shrink-0 bg-white/40">
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || students.length === 0}
          className="w-full py-3.5 bg-teal-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-teal-600/20"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {isSubmitting ? "Saving..." : "Save Attendance"}
        </button>
      </div>

    </div>
  );
}