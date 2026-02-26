import React, { useMemo } from "react";
import { Check, X, Minus, UserCircle } from "lucide-react";
import { format } from "date-fns";

export default function AttendanceBook({ batch, classes }) {
  // 1. Sort classes by class_number to ensure the columns are in order
  const sortedClasses = useMemo(() => {
    return [...(classes || [])].sort((a, b) => a.class_number - b.class_number);
  }, [classes]);

  // 2. Build the Matrix Data
  const attendanceMatrix = useMemo(() => {
    if (!batch?.students) return [];

    return batch.students.map((student) => {
      let presentCount = 0;
      let totalMarked = 0;

      const studentRecord = {
        student,
        attendance: sortedClasses.map((cls) => {
          // Find if this student was marked in this specific class
          const record = cls.attendance?.find(
            (a) => a.student === student._id || a.student?._id === student._id
          );

          if (record) {
            totalMarked++;
            if (record.status === "present") presentCount++;
          }

          return {
            classId: cls._id,
            status: record ? record.status : "unmarked",
            isCompleted: cls.is_completed,
          };
        }),
      };

      // Calculate percentage
      studentRecord.percentage = totalMarked === 0 
        ? 0 
        : Math.round((presentCount / totalMarked) * 100);

      return studentRecord;
    });
  }, [batch?.students, sortedClasses]);

  if (!batch?.students?.length) {
    return <div className="p-8 text-center text-slate-500 font-medium">No students enrolled in this batch yet.</div>;
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-800">Master Attendance Book</h3>
          <p className="text-sm font-medium text-slate-500">Cross-reference view of all scheduled classes.</p>
        </div>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div className="overflow-x-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {/* STICKY LEFT COLUMN: Student Name */}
              <th className="sticky left-0 z-20 bg-slate-50 p-4 border-b border-r border-slate-200 min-w-[250px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Student</span>
              </th>
              
              {/* PERCENTAGE COLUMN */}
              <th className="bg-slate-50 p-4 border-b border-slate-200 text-center min-w-[100px]">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Score</span>
              </th>

              {/* DYNAMIC CLASS COLUMNS */}
              {sortedClasses.map((cls) => (
                <th key={cls._id} className="bg-slate-50 p-4 border-b border-slate-200 text-center min-w-[120px]">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">
                      Class {cls.class_number}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {cls.date_scheduled ? format(new Date(cls.date_scheduled), "MMM dd") : "TBA"}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {attendanceMatrix.map((row, index) => (
              <tr key={row.student._id} className="hover:bg-slate-50/50 transition-colors group">
                
                {/* STICKY LEFT COLUMN: Student Name */}
                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 border-b border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)] transition-colors">
                  <div className="flex items-center gap-3">
                    {row.student.photo_url ? (
                      <img src={row.student.photo_url} alt="profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <UserCircle className="w-8 h-8 text-slate-300" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{row.student.student_name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{row.student.student_id}</p>
                    </div>
                  </div>
                </td>

                {/* PERCENTAGE CELL */}
                <td className="p-4 border-b border-slate-100 text-center">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-black ${
                    row.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    row.percentage >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {row.percentage}%
                  </span>
                </td>

                {/* DYNAMIC ATTENDANCE CELLS */}
                {row.attendance.map((record, i) => (
                  <td key={`${row.student._id}-${record.classId}`} className="p-4 border-b border-slate-100 text-center">
                    <div className="flex justify-center">
                      {record.status === "present" ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      ) : record.status === "absent" ? (
                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-sm">
                          <X size={16} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center border border-slate-100">
                          <Minus size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}