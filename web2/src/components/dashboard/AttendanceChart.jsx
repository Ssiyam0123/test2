import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { UserCheck } from 'lucide-react';

const AttendanceChart = ({ attendanceSummary, height = 280 }) => {
  // Format data safely
  const present = attendanceSummary?.present || 0;
  const absent = attendanceSummary?.absent || 0;
  const total = present + absent;

  const data = [
    { name: 'Present', value: present, color: '#10b981' }, // Emerald/Teal
    { name: 'Absent', value: absent, color: '#ef4444' }    // Red
  ];

  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col" style={{ height: `${height}px` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
          <UserCheck size={18} />
        </div>
        <h3 className="font-bold text-gray-800">Attendance Health</h3>
      </div>
      
      <div className="flex-1 relative min-h-0 mt-2">
        {total === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            No attendance data yet
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-800">{presentPercentage}%</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Present</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceChart;