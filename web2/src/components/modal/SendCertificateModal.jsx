import React, { useState } from "react";
import { X, Mail, Calendar, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SendCertificateModal({ isOpen, onClose, student, onSend, isSending }) {
  const [email, setEmail] = useState(student?.email || "");
  const [awardedOn, setAwardedOn] = useState(
    student?.completion_date 
      ? format(new Date(student.completion_date), "yyyy-MM-dd") 
      : format(new Date(), "yyyy-MM-dd")
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onSend({ 
      studentId: student._id, 
      payload: { email, awardedOn } 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Send Certificate</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {student?.student_name} ({student?.student_id})
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail size={12} className="text-indigo-500" /> Recipient Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Awarded On Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} className="text-teal-500" /> Awarded On
            </label>
            <input
              type="date"
              required
              value={awardedOn}
              onChange={(e) => setAwardedOn(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {isSending ? "Sending Email..." : "Send Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}