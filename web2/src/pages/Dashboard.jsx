import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../api/dashboard.api.js";
import { 
  RefreshCw, AlertCircle, Users, GraduationCap, 
  BookOpen, Layers, UserCircle, Activity, MessageSquare 
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";
import { formatDistanceToNow } from "date-fns";

// ============================================================================
// 1. REUSABLE UI COMPONENTS (Cards & Charts)
// ============================================================================

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 transition-hover hover:shadow-md">
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value || 0}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const DonutChart = ({ title, data, colors, dataKey = "count", nameKey = "_id" }) => {
  const chartData = data?.map(d => ({ name: d[nameKey] || "Unknown", value: d[dataKey] })) || [];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[300px] flex flex-col">
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <div className="flex-1 min-h-0 relative">
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius="60%" outerRadius="80%" paddingAngle={4} dataKey="value" stroke="none">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ fontWeight: 'bold', color: '#1f2937' }} 
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. MAIN DASHBOARD COMPONENT
// ============================================================================

const Dashboard = () => {
  const { data: dashboardData, isLoading, isRefetching, isError, refetch } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });

  const data = dashboardData?.data || null;

  // Global Loading State
  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
          <p className="text-gray-500 font-medium">Crunching your analytics...</p>
        </div>
      </div>
    );
  }

  // Global Error State
  if (isError) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-900">Analytics Offline</h2>
          <p className="text-red-600 mt-2">Failed to load the dashboard data.</p>
          <button onClick={() => refetch()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
        </div>
      </div>
    );
  }

  // Safe data extraction
  const { totals, charts, feeds } = data;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institute Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time pulse of your operations</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} className={isRefetching ? "animate-spin text-blue-600" : ""} />
          <span>{isRefetching ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* TOP ROW: STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Total Students" value={totals?.students?.total} subtitle={`${totals?.students?.completed} Completed`} 
          icon={Users} colorClass="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Active Students" value={totals?.students?.active} subtitle="Currently Enrolled" 
          icon={Activity} colorClass="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Total Courses" value={totals?.courses?.total} subtitle={`${totals?.courses?.active} Active`} 
          icon={BookOpen} colorClass="bg-purple-50 text-purple-600" 
        />
        <StatCard 
          title="Active Batches" value={totals?.batches?.active} subtitle={`Out of ${totals?.batches?.total} total`} 
          icon={Layers} colorClass="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          title="Instructors" value={totals?.staff?.instructors} subtitle="Active teaching staff" 
          icon={GraduationCap} colorClass="bg-teal-50 text-teal-600" 
        />
      </div>

      {/* MIDDLE ROW: TRENDS (Enrollment & Batches) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly Enrollment */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">Monthly Student Enrollment</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthlyData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Batch Population */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[350px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">Top Batches by Population</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.batchDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="batchName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', width: 100 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DEMOGRAPHICS ROW: 4 Donut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DonutChart 
          title="Student Status" 
          data={charts?.statusDistribution} 
          colors={['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6']} 
        />
        <DonutChart 
          title="Gender Breakdown" 
          data={charts?.genderDistribution} 
          colors={['#8b5cf6', '#ec4899', '#14b8a6']} 
        />
        <DonutChart 
          title="Competency Levels" 
          data={charts?.competencyDistribution} 
          colors={['#3b82f6', '#f43f5e', '#eab308']} 
        />
        
        {/* Special Attendance Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[300px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-2">Overall Attendance Health</h3>
          <div className="flex-1 relative min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: "Present", value: charts?.attendanceSummary?.present || 0 },
                    { name: "Absent", value: charts?.attendanceSummary?.absent || 0 }
                  ]} 
                  innerRadius="60%" outerRadius="80%" paddingAngle={4} dataKey="value" stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-800">
                {charts?.attendanceSummary?.present > 0 ? 
                  Math.round((charts.attendanceSummary.present / (charts.attendanceSummary.present + charts.attendanceSummary.absent)) * 100) : 0}%
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Present</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tables & Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Course Popularity Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Course Popularity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold rounded-lg">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Course Name</th>
                  <th className="px-4 py-3 text-right">Enrolled Students</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {charts?.courseDistribution?.map((course, idx) => {
                  const percentage = totals?.students?.total > 0 
                    ? ((course.students / totals.students.total) * 100).toFixed(1) 
                    : 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{course._id}</td>
                      <td className="px-4 py-3 text-right">{course.students}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span>{percentage}%</span>
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feeds Column */}
        <div className="space-y-6">
          
          {/* Recent Student Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[240px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCircle size={18} className="text-blue-500"/> New Enrollments
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {feeds?.recentActivities?.map((student) => (
                <div key={student._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800">{student.student_name}</p>
                    <p className="text-[11px] text-gray-400">{student.student_id}</p>
                  </div>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">
                    {formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Comments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-[240px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-teal-500"/> Latest Feedback
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {feeds?.recentComments?.length === 0 ? (
                 <p className="text-sm text-gray-400 text-center mt-4">No recent feedback.</p>
              ) : (
                feeds?.recentComments?.map((comment) => (
                  <div key={comment._id} className="text-sm border-b border-gray-50 pb-3 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800 text-[12px]">{comment.instructor?.full_name}</span>
                      <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      <span className="font-bold text-gray-700">Re: {comment.student?.student_name}</span> - {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;