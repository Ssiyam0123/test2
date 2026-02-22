import React from 'react';

export const InfoItem = ({ icon: Icon, label, value, color = "text-blue-500" }) => (
  <div className="flex items-start space-x-4 group min-w-0">
    <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-700 group-hover:bg-slate-700/50 transition-colors shrink-0 shadow-inner">
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      <p className="text-slate-100 font-semibold break-words leading-tight mt-1.5 text-sm md:text-base">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export const SectionCard = ({ title, icon: Icon, children, color = "text-[#EC1B23]" }) => (
  <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-xl hover:border-slate-700 transition-all duration-300">
    <h4 className="text-lg font-bold text-white mb-8 flex items-center tracking-tight">
      <span className={`p-2 bg-slate-800 rounded-xl mr-4 ring-1 ring-white/5 shadow-md ${color}`}>
        <Icon size={22} />
      </span>
      {title}
    </h4>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);