import React, { useState } from "react";
import { X, CalendarDays, CheckCircle2 } from "lucide-react";
import { useScheduleClass } from "../../hooks/useBatches";

export default function QuickScheduleModal({ batchId, classData, onClose }) {
  // যদি ক্লাসে আগে থেকেই ডেট থাকে (Reschedule), সেটা ডিফল্ট ভ্যালু হিসেবে বসবে
  const initialDate = classData?.date_scheduled 
    ? new Date(classData.date_scheduled).toISOString().split("T")[0] 
    : "";
    
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const { mutate: scheduleClass, isPending } = useScheduleClass(batchId);

  const handleSchedule = () => {
    if (!selectedDate) return;
    
    scheduleClass(
      { 
        classContentId: classData._id, 
        date_scheduled: new Date(selectedDate).toISOString() 
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-black text-gray-800">
              {classData.date_scheduled ? "Reschedule Class" : "Schedule Class"}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              {classData.class_number}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-gray-200">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/50">
            <p className="text-sm font-bold text-gray-800 line-clamp-2">{classData.topic}</p>
            <span className="text-[10px] font-black text-teal-600 uppercase mt-1 block">{classData.class_type}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Pick a Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none" 
              />
            </div>
          </div>

          <button 
            onClick={handleSchedule}
            disabled={isPending || !selectedDate}
            className="w-full py-3.5 bg-teal-600 text-white rounded-xl text-[12px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : (
              <>
                <CheckCircle2 size={18} /> {classData.date_scheduled ? "Update Date" : "Set Date"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}