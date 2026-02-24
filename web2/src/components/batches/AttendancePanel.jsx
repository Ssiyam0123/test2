import React, { useState, useEffect } from "react";
import { Check, X, Save, UserX } from "lucide-react";
import Avatar from "../../components/common/Avatar"; // Your avatar component
import { API } from "../../api/axios"; // Your axios instance
import toast from "react-hot-toast";

const AttendancePanel = ({ selectedClass, batchStudents }) => {
    console.log(batchStudents)
  // Local state to track changes before saving
  const [attendanceState, setAttendanceState] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Sync with database data when a class is clicked
  useEffect(() => {
    if (selectedClass) {
      const initialState = {};
      // If the class already has attendance saved in DB, load it
      if (selectedClass.attendance && selectedClass.attendance.length > 0) {
        selectedClass.attendance.forEach(record => {
          // record.student might be an object if populated, or string ID
          const studentId = typeof record.student === 'object' ? record.student._id : record.student;
          initialState[studentId] = record.status;
        });
      }
      setAttendanceState(initialState);
    }
  }, [selectedClass]);

  // Handle marking present/absent
  const markAttendance = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save to Database
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    try {
      // Format data for the backend array
      const attendanceRecords = Object.keys(attendanceState).map(studentId => ({
        student: studentId,
        status: attendanceState[studentId]
      }));

      await API.put(`/batches/classes/${selectedClass._id}/attendance`, { attendanceRecords });
      toast.success("Attendance saved successfully!");
    } catch (error) {
      toast.error("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!batchStudents || batchStudents.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <UserX className="mx-auto mb-2 opacity-50" size={32} />
        <p>No students found in this batch.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-800">
          Class {selectedClass.class_number} Attendance
        </h3>
        <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-md">
          {batchStudents.length} Students
        </span>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-2">
        {batchStudents.map((student) => {
          const status = attendanceState[student._id];

          return (
            <div 
              key={student._id} 
              className={`flex items-center justify-between p-3 mb-2 rounded-xl border transition-all ${
                status === 'present' ? 'border-teal-200 bg-teal-50' : 
                status === 'absent' ? 'border-red-200 bg-red-50' : 
                'border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={student.photo_url} alt={student.student_name} fallbackText={student.student_name} size="sm" />
                <div>
                  <p className="text-sm font-bold text-gray-800">{student.student_name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">ID: {student.student_id}</p>
                </div>
              </div>

              {/* Action Buttons (✓ / X) */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg shadow-sm border border-gray-100">
                <button
                  onClick={() => markAttendance(student._id, 'present')}
                  className={`p-1.5 rounded-md transition-all ${
                    status === 'present' 
                      ? 'bg-teal-500 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                  title="Mark Present"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                
                <button
                  onClick={() => markAttendance(student._id, 'absent')}
                  className={`p-1.5 rounded-md transition-all ${
                    status === 'absent' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                  }`}
                  title="Mark Absent"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button Fixed at Bottom */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || Object.keys(attendanceState).length === 0}
          className="w-full py-3 bg-[#000c1d] hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default AttendancePanel;