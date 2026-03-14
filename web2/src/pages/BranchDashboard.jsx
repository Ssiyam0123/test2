import React from "react";
import {
  Users,
  CalendarDays,
  MapPin,
  Loader2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowLeft,
  Activity,
  UserPlus,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import useAuth from "../store/useAuth";
import { useBranchStats } from "../hooks/useDashboard.js";
import Avatar from "../components/common/Avatar"; // 🚀 নিশ্চিত কর পাথ ঠিক আছে
import { format } from "date-fns";

const BranchDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const context = useOutletContext() || {};

  const branchId =
    id || context.branchId || authUser?.branch?._id || authUser?.branch;
  const { data: dashData, isLoading, isError } = useBranchStats(branchId);

  const branchName =
    dashData?.branchName ||
    context.branchName ||
    authUser?.branch?.branch_name ||
    "Campus Analytics";

  if (isLoading)
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-teal-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-black uppercase tracking-[0.2em] text-[10px] text-slate-400">
          Syncing Campus Intelligence...
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 text-center max-w-sm">
          <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 uppercase">
            Access Denied
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            We couldn't retrieve stats for this branch. Please ensure you have
            permissions.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const stats = [
    {
      label: "Total Students",
      value: dashData?.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Batches",
      value: dashData?.activeBatches,
      icon: CalendarDays,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Revenue (YTD)",
      value: `৳${dashData?.totalRevenue?.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Logistics",
      value: dashData?.pendingLogistics,
      icon: Package,
      color: "text-rose-600",
      bg: "bg-rose-50",
      alert: dashData?.pendingLogistics > 0,
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. TOP NAVIGATION & HEADER */}
      <div>
        {id && (
          <button
            onClick={() => navigate("/admin/branches")}
            className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Campuses
          </button>
        )}

        <div className="bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
              <MapPin size={12} /> {branchName}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
              Branch <span className="text-teal-400">Hub</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-3 italic">
              Operational Performance Analytics • 2026
            </p>
          </div>

          <div className="z-10 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hidden lg:block min-w-[200px]">
            <div className="flex items-center gap-3 mb-2 text-teal-400">
              <Activity size={18} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                System Health
              </p>
            </div>
            <p className="text-xl font-black text-white">Live & Synced</p>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* 2. KEY PERFORMANCE INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div
              className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}
            >
              <item.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                {item.label}
              </p>
              <h3
                className={`text-2xl font-black tracking-tighter ${item.alert ? "text-rose-500 animate-pulse" : "text-slate-800"}`}
              >
                {item.value || 0}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3. REVENUE TREND BOX */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-500" /> Revenue
                Growth
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                Current Year Trajectory
              </p>
            </div>
            <span className="text-[10px] font-black bg-slate-50 border border-slate-100 text-slate-500 px-4 py-1.5 rounded-full">
              FY 2026
            </span>
          </div>

          <div className="h-64 flex items-end gap-3 px-4 relative border-b border-slate-100 pb-2">
            {dashData?.revenueChart?.map((m, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                <div
                  className="w-full bg-slate-50 rounded-t-xl group-hover:bg-teal-500 transition-all duration-500 relative"
                  style={{
                    height: `${(m.amount / (Math.max(...dashData.revenueChart.map((x) => x.amount)) || 1)) * 100}%`,
                  }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 font-black shadow-lg">
                    ৳{m.amount.toLocaleString()}
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-4 uppercase tracking-tighter">
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. LOGISTICS & STAFFING PANELS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-teal-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-lg shadow-teal-100">
            <div className="relative z-10">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-6">
                Logistics Desk
              </h3>
              <p className="text-5xl font-black mb-2 tracking-tighter">
                {dashData?.pendingLogistics || 0}
              </p>
              <p className="text-[10px] font-bold opacity-90 mb-8 uppercase tracking-widest">
                Awaiting Admin Action
              </p>
              <button
                onClick={() => navigate("/admin/inventory")}
                className="w-full py-4 bg-white text-teal-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Go to Inventory <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Users size={14} /> Registered Faculty
            </h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Users className="text-indigo-500" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Active Instructors
                </p>
                <p className="text-lg font-black text-slate-800">
                  {dashData?.instructors || 0} Professional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 5. NEW: ACTIVITY FEED (Recent Students & Payments) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Recent Activity
              Feed
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
            {/* Recent Students */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <UserPlus size={14} className="text-blue-500" /> New Enrollments
              </p>
              <div className="space-y-3">
                {dashData?.recentActivities?.students?.map((s) => (
                  <div
                    key={s.student_id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group"
                  >
                    <Avatar
                      src={s.photo_url}
                      fallbackText={s.student_name}
                      sizeClass="w-10 h-10 shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase group-hover:text-blue-600 transition-colors">
                        {s.student_name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {s.student_id} •{" "}
                        {format(new Date(s.createdAt), "dd MMM")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!dashData?.recentActivities?.students ||
                  dashData?.recentActivities?.students?.length === 0) && (
                  <p className="text-[10px] font-bold text-slate-300 uppercase italic">
                    No new students
                  </p>
                )}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <CreditCard size={14} className="text-emerald-500" /> Latest
                Payments
              </p>
              <div className="space-y-3">
                {dashData?.recentActivities?.payments?.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase">
                        {p.student?.student_name?.split(" ")[0]}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {p.payment_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 tracking-tight">
                        ৳{p.amount?.toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">
                        {format(new Date(p.createdAt), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                {(!dashData?.recentActivities?.payments ||
                  dashData?.recentActivities?.payments?.length === 0) && (
                  <p className="text-[10px] font-bold text-slate-300 uppercase italic">
                    No recent payments
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDashboard;
