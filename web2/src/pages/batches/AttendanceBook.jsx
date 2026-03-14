import React, { useMemo } from "react";
import { Check, X, Minus, UserCircle, PieChart } from "lucide-react";
import { format } from "date-fns";
import Avatar from "../../components/common/Avatar";

export default function AttendanceBook({ batch, classes }) {
  const sortedClasses = useMemo(() => {
    return [...(classes || [])].sort((a, b) => a.class_number - b.class_number);
  }, [classes]);

  const attendanceMatrix = useMemo(() => {
    if (!batch?.students) return [];

    return batch.students.map((student) => {
      let presentCount = 0;
      let totalMarked = 0;

      const attendance = sortedClasses.map((cls) => {
        const record = cls.attendance?.find(
          (a) => (a.student?._id || a.student) === (student._id || student),
        );

        let normalizedStatus = "unmarked";

        if (record && record.status) {
          totalMarked++;
          normalizedStatus = record.status.toLowerCase();
          if (normalizedStatus === "present") {
            presentCount++;
          }
        }

        return { status: normalizedStatus };
      });

      return {
        student,
        attendance,
        percentage:
          totalMarked === 0
            ? 0
            : Math.round((presentCount / totalMarked) * 100),
      };
    });
  }, [batch?.students, sortedClasses]);

  if (!batch?.students?.length)
    return (
      <div className="p-20 text-center font-black text-slate-300 uppercase tracking-[0.2em] bg-white rounded-[2.5rem] border border-slate-100">
        No students enrolled in this batch yet.
      </div>
    );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="sticky left-0 z-30 bg-slate-100/90 backdrop-blur-md p-6 border-b border-r border-slate-200 min-w-[260px]">
                <div className="flex items-center gap-2">
                   <UserCircle size={16} className="text-slate-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate Identity</span>
                </div>
              </th>
              <th className="p-6 border-b border-slate-200 text-center min-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                   <PieChart size={14} className="text-indigo-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retention %</span>
                </div>
              </th>
              {sortedClasses.map((cls) => (
                <th
                  key={cls._id}
                  className="p-6 border-b border-slate-200 text-center min-w-[120px]"
                >
                  <span className="block text-[10px] font-black uppercase text-teal-600 tracking-tighter">
                    L-{cls.class_number}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                    {cls.date_scheduled ? format(new Date(cls.date_scheduled), "dd MMM") : "TBA"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attendanceMatrix.map((row) => (
              <tr
                key={row.student._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 p-5 border-r border-slate-100 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-4">
                    
                    {/* 🚀 Avatar Component Integration */}
                    <Avatar 
                      src={row.student.profile_picture || row.student.image} 
                      alt={row.student.student_name}
                      fallbackText={row.student.student_name}
                      sizeClass="w-10 h-10"
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">
                        {row.student.student_name}
                      </p>
                      <p className="text-[10px] font-bold text-indigo-500 tracking-widest">
                        #{row.student.student_id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black border ${
                      row.percentage >= 80 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : row.percentage >= 50 
                          ? "bg-amber-50 text-amber-600 border-amber-100" 
                          : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}
                  >
                    {row.percentage}%
                  </span>
                </td>
                {row.attendance.map((record, i) => (
                  <td
                    key={i}
                    className="p-5 text-center"
                  >
                    <div className="flex justify-center">
                      {record.status === "present" ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                           <Check className="text-emerald-500" size={16} strokeWidth={4} />
                        </div>
                      ) : record.status === "absent" ? (
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                           <X className="text-rose-500" size={16} strokeWidth={4} />
                        </div>
                      ) : (
                        <Minus className="text-slate-200" size={16} />
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