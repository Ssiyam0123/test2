import React from "react";
import { Users, BookOpen, CalendarDays, MapPin, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import useAuth from "../store/useAuth";
import { useBranchStats } from "../hooks/useDashboard.js";

const BranchDashboard = () => {
  const { authUser } = useAuth();
  const context = useOutletContext() || {};
  
  // Safe extraction of Branch Info
  const branchId = context.branchId || authUser?.branch?._id || authUser?.branch;
  const branchName = context.branchName || authUser?.branch?.branch_name || "Campus Overview";

  // Fetch real-time data
  const { data: dashboardData, isLoading, isError, error } = useBranchStats(branchId);

  // Loading State
  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-teal-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">Syncing Campus Intelligence...</p>
      </div>
    );
  }

  // Error State (Handles 403 or Network errors)
  if (isError) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 max-w-md">
          <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">
            {error?.response?.status === 403 
              ? "You do not have sufficient permissions to view this branch's statistics." 
              : "We encountered an error while fetching the dashboard data."}
          </p>
        </div>
      </div>
    );
  }

  // Metric Configuration
  const metrics = [
    { 
      label: "Total Students", 
      value: dashboardData?.totalStudents || 0, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    { 
      label: "Active Batches", 
      value: dashboardData?.activeBatches || 0, 
      icon: CalendarDays, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    { 
      label: "Faculty Members", 
      value: dashboardData?.instructors || 0, 
      icon: Users, 
      color: "text-teal-600", 
      bg: "bg-teal-50",
      border: "border-teal-100"
    },
    { 
      label: "Active Courses", 
      value: dashboardData?.activeCourses || 0, 
      icon: BookOpen, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest mb-4">
            <MapPin size={12} /> {branchName}
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter uppercase">
            Campus <span className="text-teal-600">Analytics</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
            Operational overview for {authUser?.full_name}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 relative z-10">
           <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-100">
              <BarChart3 size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">System Status</p>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-tighter">Verified & Online</p>
           </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-50/30 to-transparent pointer-events-none" />
      </div>

      {/* METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((item, idx) => (
          <div key={idx} className={`bg-white rounded-[2rem] p-6 border ${item.border} flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group`}>
            <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}>
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{item.value.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* BATCH PERFORMANCE TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-teal-500 rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Batch Enrollment Status</h2>
          </div>
          <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase">
            Live Feed
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {dashboardData?.chartData?.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <CalendarDays size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No active data streams found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-10 border-b border-slate-50">Batch Identity</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-50">Enrollment Metrics</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10 border-b border-slate-50">Provisioned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {dashboardData?.chartData?.map((batch) => (
                  <tr key={batch._id} className="hover:bg-teal-50/20 transition-colors group">
                    <td className="p-6 pl-10">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-teal-600 transition-colors">{batch.batch_name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Active Session</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700">
                        <Users size={12} className="mr-2" />
                        <span className="text-xs font-black uppercase tracking-tighter">{batch.student_count} Enrolled</span>
                      </div>
                    </td>
                    <td className="p-6 pr-10 text-right">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                        {new Date(batch.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
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