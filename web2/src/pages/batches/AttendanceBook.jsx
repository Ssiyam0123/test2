import React, { useMemo } from "react";
import { Check, X, Minus, UserCircle } from "lucide-react";
import { format } from "date-fns";

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
      <div className="p-20 text-center font-bold text-slate-400">
        No students enrolled yet.
      </div>
    );

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-20 bg-slate-50 p-5 border-b border-r border-slate-200 min-w-[240px]">
                Student
              </th>
              <th className="p-5 border-b border-slate-200 text-center min-w-[100px]">
                Avg Score
              </th>
              {sortedClasses.map((cls) => (
                <th
                  key={cls._id}
                  className="p-5 border-b border-slate-200 text-center min-w-[110px]"
                >
                  <span className="block text-[10px] font-black uppercase text-slate-400">
                    Class {cls.class_number}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    {cls.date_scheduled
                      ? format(new Date(cls.date_scheduled), "MMM dd")
                      : "TBA"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attendanceMatrix.map((row) => (
              <tr
                key={row.student._id}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 p-4 border-b border-r border-slate-100 shadow-sm transition-colors">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-slate-300 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {row.student.student_name}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        {row.student.student_id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 border-b border-slate-100 text-center">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black ${row.percentage >= 80 ? "bg-emerald-50 text-emerald-600" : row.percentage >= 50 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
                  >
                    {row.percentage}%
                  </span>
                </td>
                {row.attendance.map((record, i) => (
                  <td
                    key={i}
                    className="p-4 border-b border-slate-100 text-center"
                  >
                    <div className="flex justify-center">
                      {record.status === "present" ? (
                        <Check
                          className="text-emerald-500"
                          size={18}
                          strokeWidth={4}
                        />
                      ) : record.status === "absent" ? (
                        <X
                          className="text-rose-500"
                          size={18}
                          strokeWidth={4}
                        />
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