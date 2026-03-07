import React, { useState, useEffect } from "react";
import { Check, X, Save, UserX } from "lucide-react";
import Avatar from "../../components/common/Avatar";
import { useUpdateClassAttendance } from "../../hooks/useBatches"; 
import toast from "react-hot-toast";

const AttendancePanel = ({ selectedClass, batchStudents }) => {
  const [attendanceState, setAttendanceState] = useState({});
  
  const { mutate: updateAttendance, isPending: isSaving } = useUpdateClassAttendance();

  useEffect(() => {
    if (selectedClass) {
      const initialState = {};
      if (selectedClass.attendance?.length > 0) {
        selectedClass.attendance.forEach(record => {
          const studentId = typeof record.student === 'object' ? record.student._id : record.student;
          initialState[studentId] = record.status; // Fetched from DB
        });
      }
      setAttendanceState(initialState);
    }
  }, [selectedClass]);

  const markAttendance = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status 
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || !selectedClass._id) {
      toast.error("Error: Class information is missing.");
      return;
    }

    const attendanceRecords = Object.keys(attendanceState)
      .map(studentId => {
        const studentObj = batchStudents.find(s => s._id === studentId);
        return {
          student: studentId,
          student_name: studentObj ? studentObj.student_name : "Unknown Student",
          status: attendanceState[studentId]
        };
      })
      .filter(record => record.status !== null);

    const batchId = typeof selectedClass.batch === 'object' ? selectedClass.batch._id : selectedClass.batch;

    updateAttendance({ 
      classId: selectedClass._id, 
      batchId: batchId,
      attendanceRecords 
      // is_completed is not sent here, so it remains unchanged!
    });
  };

  const validStudents = Array.isArray(batchStudents) 
    ? batchStudents.filter(s => s && s._id)
    : [];

  if (validStudents.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400">
        <UserX className="mx-auto mb-3 opacity-20" size={48} />
        <p className="text-sm font-bold">No students found in this batch.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="sticky top-0 z-20 p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/90 backdrop-blur-md">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-gray-800 truncate">
            Class {selectedClass.class_number}
          </h3>
          <p className="text-[10px] font-bold text-teal-600 truncate">{selectedClass.topic}</p>
        </div>
        <span className="shrink-0 text-[10px] font-black bg-teal-100 text-teal-800 px-2 py-1 rounded-lg">
          {validStudents.length} ENROLLED
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
                status === 'Present' ? 'border-teal-200 bg-teal-50/50' : 
                status === 'Absent' ? 'border-red-200 bg-red-50/50' : 
                'border-gray-100 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={student.photo_url} fallbackText={student.student_name} size="sm" />
                <div className="leading-tight">
                  <p className="text-xs font-bold text-gray-800">{student.student_name}</p>
                  <p className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">{student.student_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-100" onClick={(e) => e.stopPropagation()}>
                {/* 🚀 FIXED: Passing Capitalized Statuses */}
                <button
                  onClick={() => markAttendance(student._id, 'Present')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'Present' ? 'bg-teal-500 text-white shadow-lg shadow-teal-200' : 'text-gray-300'}`}
                >
                  <Check size={14} strokeWidth={3} />
                </button>
                <button
                  onClick={() => markAttendance(student._id, 'Absent')}
                  className={`p-1.5 rounded-lg transition-all ${status === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'text-gray-300'}`}
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white pb-6 md:pb-4">
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || Object.keys(attendanceState).length === 0}
          className="w-full py-4 bg-[#1e293b] hover:bg-slate-800 text-white text-[11px] font-black tracking-[0.2em] uppercase rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-30 shadow-xl active:scale-[0.95]"
        >
          <Save size={16} />
          {isSaving ? "Syncing..." : "Update Records"}
        </button>
      </div>
    </div>
  );
};

export default AttendancePanel;