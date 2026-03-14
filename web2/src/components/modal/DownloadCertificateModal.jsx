import React, { useState } from "react";
import { X, Calendar, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function DownloadCertificateModal({ isOpen, onClose, student, onDownload, isDownloading }) {
  const [awardedOn, setAwardedOn] = useState(
    student?.completion_date 
      ? format(new Date(student.completion_date), "yyyy-MM-dd") 
      : format(new Date(), "yyyy-MM-dd")
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onDownload({ student, awardedOn });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Download Certificate</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {student?.student_name}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} className="text-teal-500" /> Awarded On Date
            </label>
            <input
              type="date"
              required
              value={awardedOn}
              onChange={(e) => setAwardedOn(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isDownloading ? "Generating PDF..." : "Download Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}