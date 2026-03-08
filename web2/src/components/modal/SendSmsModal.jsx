import React, { useState, useEffect } from "react";
import { X, MessageSquareText, Loader2, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sendSMSReminderAPI } from "../../api/finance.api";

export default function SendSmsModal({ isOpen, onClose, student, dueAmount }) {
  // 🟢 State for editable fields
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // 🟢 Pre-fill data when modal opens
  useEffect(() => {
    if (student) {
      setPhone(student.contact_number || "");
      setMessage(`Dear ${student.student_name},\nThis is a gentle reminder from the institute. Your pending fee is BDT ${dueAmount.toLocaleString()}.\nPlease clear your dues at your earliest convenience.\n\nIgnore this message if already paid. Thank you!`);
    }
  }, [student, dueAmount]);

  // 🚀 API Mutation
  const { mutate: sendSMS, isPending } = useMutation({
    mutationFn: sendSMSReminderAPI,
    onSuccess: (res) => {
      toast.success(res.message || "SMS Reminder Sent Successfully!");
      onClose(); // Close modal on success
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send SMS");
    }
  });

  const handleSend = () => {
    if (!phone) return toast.error("Phone number is required!");
    if (!message) return toast.error("Message cannot be empty!");

    sendSMS({
      studentId: student._id,
      dueAmount: dueAmount,
      contactNumber: phone,     // Sending the editable phone number
      studentName: student.student_name,
      customMessage: message    // 🚀 Sending the custom edited message
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3 text-indigo-600">
            <MessageSquareText size={24} />
            <h2 className="text-lg font-black tracking-tight">Send SMS Reminder</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white text-slate-400 hover:text-rose-500 rounded-full shadow-sm transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Phone Number Input */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Recipient Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 017XXXXXXXX"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SMS Content</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all custom-scrollbar resize-none"
            />
            <p className="text-[10px] font-bold text-slate-400 mt-2 text-right">
              {message.length} characters
            </p>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={isPending}
            className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isPending ? "Sending..." : "Send Now"}
          </button>
        </div>

      </div>
    </div>
  );
}