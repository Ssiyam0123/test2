import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, BookOpen, Layers, Building2, TrendingUp, MapPin } from "lucide-react";
import { useBranch } from "../../hooks/useBranches"; 
import { useBranchStats } from "../../hooks/useDashboard"; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import LogoLoader from "../../components/LogoLoader";

export default function BranchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Parallel fetching with separate loading states
  const { data: branchRes, isLoading: branchLoading } = useBranch(id);
  const { data: statsRes, isLoading: statsLoading } = useBranchStats(id);

  const branch = branchRes?.data;
  const stats = statsRes?.data;

  if (branchLoading || statsLoading) return <LogoLoader />;
  if (!branch) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Branch Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-semibold underline">Go Back</button>
      </div>
    </div>
  );

  const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans pb-20">
      
      {/* 1. Dynamic Header Section */}
      <div className="h-56 bg-gradient-to-br from-slate-900 via-[#1e293b] to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 pt-10 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-slate-300 hover:text-white transition-all bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 text-sm font-medium"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Directory
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        
        {/* 2. Branch Identity Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-100 transform -rotate-3">
              {branch.branch_code}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{branch.branch_name}</h1>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-2 text-lg">
                <MapPin size={18} className="text-slate-400" /> {branch.address}
              </p>
            </div>
          </div>
          <div className={`px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest ${branch.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            {branch.is_active ? "• Operational" : "• Suspended"}
          </div>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={Users} title="Total Enrollment" value={stats?.totalStudents || 0} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={Layers} title="Active Batches" value={stats?.activeBatches || 0} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={UserCheck} title="Faculty Count" value={stats?.instructors || 0} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={BookOpen} title="Course Catalog" value={stats?.activeCourses || 0} color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* 4. Enrollment Graph */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-indigo-500" size={28} /> Enrollment Distribution
              </h3>
              <p className="text-slate-500 font-medium mt-1">Real-time student volume across latest batches</p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Last 10 Batches
            </div>
          </div>

          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="batch_name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="student_count" radius={[12, 12, 12, 12]} barSize={45}>
                  {(stats?.chartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl">
        <p className="text-white font-bold text-sm mb-1">{payload[0].payload.batch_name}</p>
        <p className="text-indigo-400 font-black text-lg">{payload[0].value} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-1">Students</span></p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ icon: Icon, title, value, color, bg }) => (
  <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200/60 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-5 rounded-[1.5rem] ${bg} ${color}`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</p>
      <p className="text-3xl font-black text-slate-800 leading-tight mt-1">{value}</p>
    </div>
  </div>
);