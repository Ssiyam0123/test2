import React, { useState, useMemo } from "react";
import { 
  Building2, Layers, TrendingUp, Receipt, Filter, 
  ArrowLeft, Loader2, AlertCircle, PackageSearch
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBranches } from "../hooks/useBranches";
import { useBatches } from "../hooks/useBatches";
import { useExpenseByClass } from "../hooks/useExpenses";
import useAuth from "../store/useAuth";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { format } from "date-fns";

const ExpenseAnalyticsPage = () => {
  const { isMaster, authUser } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [selectedBranch, setSelectedBranch] = useState(authUser?.branch?._id || authUser?.branch);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [activeClass, setActiveClass] = useState(null);

  const { data: branches = [] } = useBranches();
  
  const { data: batchRes } = useBatches({ branch: selectedBranch });
  const batches = Array.isArray(batchRes) ? batchRes : batchRes?.data || [];

  const { data: classStats = [], isLoading, isError } = useExpenseByClass(selectedBranch, selectedBatch);

  // console.log(classStats)

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* 1. GLASS-MORPHISM HEADER */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div>
           <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-teal-400 transition-all">
             <ArrowLeft size={14} /> Back to Dashboard
           </button>
           <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
             Expense <span className="text-teal-400">Ledger</span>
           </h1>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 italic">Class-wise Resource Consumption Analysis</p>
        </div>

        <div className="flex flex-wrap gap-4">
           {isMaster() && (
             <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <Building2 size={16} className="ml-2 text-teal-400" />
                <select 
                  className="bg-transparent text-xs font-black uppercase outline-none pr-8 cursor-pointer"
                  value={selectedBranch}
                  onChange={(e) => { setSelectedBranch(e.target.value); setSelectedBatch(""); setActiveClass(null); }}
                >
                  {branches.map(b => <option key={b._id} value={b._id} className="text-slate-900">{b.branch_name}</option>)}
                </select>
             </div>
           )}

           <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 flex items-center gap-2">
              <Layers size={16} className="ml-2 text-indigo-400" />
              <select 
                className="bg-transparent text-xs font-black uppercase outline-none pr-8 cursor-pointer"
                value={selectedBatch}
                onChange={(e) => { setSelectedBatch(e.target.value); setActiveClass(null); }}
              >
                <option value="" className="text-slate-900">All Batches</option>
                {batches.map(b => <option key={b._id} value={b._id} className="text-slate-900">{b.batch_name}</option>)}
              </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. COST BAR CHART */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-teal-500" /> Cost trajectory (L-Wise)
            </h3>
            {classStats.length > 0 && <span className="text-[9px] font-black bg-teal-50 text-teal-600 px-3 py-1 rounded-full uppercase tracking-tighter">Click Bar for items</span>}
          </div>

          <div className="flex-1 relative z-10">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-teal-500">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="text-[10px] font-black uppercase">Fetching Ledger...</p>
              </div>
            ) : classStats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <PackageSearch size={64} className="mb-4" />
                <p className="font-black uppercase text-xs">No Requisition Data Found for this selection</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={classStats} onClick={(data) => data && setActiveClass(data.activePayload[0].payload)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="class_number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 11, fontWeight: 900, fill: '#64748b'}} 
                    label={{ value: 'LECTURE NUMBER', position: 'insideBottom', offset: -5, fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 900, fill: '#64748b'}} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    content={({active, payload}) => active && payload && (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase text-teal-400">L-{payload[0].payload.class_number} • {payload[0].payload.topic}</p>
                        <p className="text-lg font-black mt-1 tracking-tighter">৳{payload[0].value.toLocaleString()}</p>
                      </div>
                    )} 
                  />
                  <Bar dataKey="totalCost" radius={[10, 10, 0, 0]} barSize={40} className="cursor-pointer">
                    {classStats.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={activeClass?._id === entry._id ? '#0f172a' : COLORS[index % COLORS.length]} 
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
        </div>

        {/* 3. DETAILED BREAKDOWN LIST */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden h-[600px]">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <Receipt size={16} className="text-rose-500" /> Resource Breakdown
             </h3>
             {activeClass && (
               <div className="mt-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                 <p className="text-[10px] font-black text-teal-600 uppercase">Selected Lecture {activeClass.class_number}</p>
                 <p className="text-xs font-bold text-slate-700 truncate">{activeClass.topic}</p>
               </div>
             )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!activeClass ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                 <Filter size={48} className="mb-4 text-slate-300" />
                 <p className="text-[10px] font-black uppercase leading-relaxed">Select a session bar from the chart to view requisition details</p>
              </div>
            ) : (
              activeClass.breakdown.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-teal-200 transition-all duration-300">
                  <div className="flex justify-between items-start">
                     <div className="min-w-0">
                       <p className="text-xs font-black text-slate-800 uppercase truncate mb-1">{item.title}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{format(new Date(item.date), 'dd MMM, yyyy')}</p>
                     </div>
                     <p className="text-sm font-black text-slate-900 tracking-tight shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                       ৳{item.amount.toLocaleString()}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {activeClass && (
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-inner">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Subtotal</span>
               <span className="text-2xl font-black tracking-tighter text-teal-400">৳{activeClass.totalCost.toLocaleString()}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExpenseAnalyticsPage;