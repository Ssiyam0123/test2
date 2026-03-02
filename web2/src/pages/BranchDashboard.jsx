import React from "react";
import useAuth from "../store/useAuth";
import { Users, BookOpen, CalendarDays, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useBranchStats } from "../hooks/useDashboard.js"; // 🚀 Import your new hook

const BranchDashboard = () => {
  const { authUser } = useAuth();
  const context = useOutletContext() || {};
  
  // Extract branch ID and Name safely
  const branchId = context.branchId || authUser?.branch?._id || authUser?.branch;
  const branchName = context.branchName || authUser?.branch?.branch_name || "Your Campus";

  // 🚀 Fetch the real data using the hook!
  const { data: statsRes, isLoading, isError } = useBranchStats(branchId);
  const dashboardData = statsRes?.data;

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-teal-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold uppercase tracking-widest text-sm text-slate-500">Loading Campus Data...</p>
      </div>
    );
  }

  // Handle Error State
  if (isError) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-rose-500">
        <AlertCircle size={64} className="mb-4 opacity-50" />
        <h2 className="text-2xl font-black mb-2">Data Unavailable</h2>
        <p className="font-medium text-slate-500">We could not fetch the dashboard statistics for this campus.</p>
      </div>
    );
  }

  // Map the real data to the UI cards
  const stats = [
    { 
      label: "Total Students", 
      value: dashboardData?.totalStudents || 0, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      label: "Active Batches", 
      value: dashboardData?.activeBatches || 0, 
      icon: CalendarDays, 
      color: "text-amber-600", 
      bg: "bg-amber-100" 
    },
    { 
      label: "Instructors", 
      value: dashboardData?.instructors || 0, 
      icon: Users, 
      color: "text-teal-600", 
      bg: "bg-teal-100" 
    },
    { 
      label: "Active Courses", 
      value: dashboardData?.activeCourses || 0, 
      icon: BookOpen, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest mb-4 border border-teal-100">
            <MapPin size={14} /> {branchName}
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 capitalize">
            Welcome back, {authUser?.full_name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p className="text-slate-500 font-medium">
            Here is the current overview of your campus operations.
          </p>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-teal-50 to-transparent opacity-50 pointer-events-none"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800">{stat.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT BATCHES TABLE (From Chart Data) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <CalendarDays size={20} className="text-slate-500" />
          <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">Recent Batches</h2>
        </div>
        
        <div className="overflow-x-auto">
          {dashboardData?.chartData?.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-bold">No batches found for this campus.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest pl-6">Batch Name</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Student Count</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right pr-6">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData?.chartData?.map((batch) => (
                  <tr key={batch._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-800">{batch.batch_name}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                        {batch.student_count} Enrolled
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-sm font-medium text-slate-500">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default BranchDashboard;