// src/pages/branches/BranchDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, BookOpen, Layers, Building2 } from "lucide-react";
import { useBranch } from "../../hooks/useBranches";
import LogoLoader from "../../components/LogoLoader";
// import { useBranchStats } from "../../hooks/useAnalytics"; // You'll build this hook to fetch branch-specific numbers

export default function BranchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: branchResponse, isLoading } = useBranch(id);
  const branch = branchResponse?.data;

  // Placeholder for your future backend stats fetch
  // const { data: stats } = useBranchStats(id); 
  const stats = {
    totalStudents: 142,
    activeBatches: 8,
    instructors: 12,
    activeCourses: 5
  };

  if (isLoading) return <LogoLoader />;
  if (!branch) return <div className="p-8 text-center text-rose-500">Branch not found.</div>;

  return (
    <div className="min-h-screen bg-[#f4f7fb] font-sans pb-20">
      
      {/* Premium Cover Header */}
      <div className="h-48 bg-gradient-to-r from-slate-900 via-[#0f172a] to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium text-sm group bg-white/5 px-4 py-2 rounded-full w-fit backdrop-blur-sm border border-white/10">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Branches
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        
        {/* Branch Identity Header */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-indigo-100">
              {branch.branch_code}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{branch.branch_name}</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <Building2 size={16} /> {branch.address}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider ${branch.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {branch.is_active ? "Operational" : "Suspended"}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} title="Enrolled Students" value={stats.totalStudents} color="text-blue-600" bg="bg-blue-50" />
          <StatCard icon={Layers} title="Active Batches" value={stats.activeBatches} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={UserCheck} title="Staff & Instructors" value={stats.instructors} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={BookOpen} title="Courses Offered" value={stats.activeCourses} color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* Future Expansion Area */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm text-center">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Detailed Analytics Hub</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            You can inject charts here later showing enrollment trends or revenue specifically isolated to the {branch.branch_code} campus.
          </p>
        </div>

      </div>
    </div>
  );
}

// Reusable Stat Card Sub-component
const StatCard = ({ icon: Icon, title, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/60 flex items-center gap-5">
    <div className={`p-4 rounded-2xl ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-800 leading-tight mt-1">{value}</p>
    </div>
  </div>
);