// src/pages/branches/ManageBranches.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Search, MapPin, Users, BookOpen, ChevronRight } from "lucide-react";
import { useBranches } from "../../hooks/useBranches";
import LogoLoader from "../../components/LogoLoader";

export default function ManageBranches() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: branchesResponse, isLoading, isError } = useBranches();

  const branches = branchesResponse?.data || [];

  const filteredBranches = branches.filter((b) => 
    b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.branch_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LogoLoader />;
  if (isError) return <div className="text-center text-rose-500 p-8">Failed to load branches.</div>;

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Branch Operations</h1>
            <p className="text-slate-500 font-medium mt-1">Select a campus to view real-time statistics and analytics.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Find a branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div 
              key={branch._id}
              onClick={() => navigate(`/admin/branches/${branch._id}`)}
              className="group bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${branch.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${branch.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  {branch.branch_code}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${branch.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {branch.is_active ? "Active" : "Suspended"}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {branch.branch_name}
              </h2>
              
              <p className="text-sm text-slate-500 flex items-start gap-2 mb-6 h-10 line-clamp-2">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                {branch.address}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Analytics <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}