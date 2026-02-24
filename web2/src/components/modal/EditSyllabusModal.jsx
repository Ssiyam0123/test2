import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Save, Trash2 } from "lucide-react";
import { useUpdateClassContent, useDeleteClass } from "../../hooks/useBatches";

export default function EditSyllabusModal({ batchId, classData, onClose }) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const { mutate: updateClass, isPending } = useUpdateClassContent(batchId);
  const { mutate: deleteClass } = useDeleteClass(batchId);

  // যখনই classData চেঞ্জ হবে, ফর্মের ভ্যালুগুলো আপডেট হবে
  useEffect(() => {
    if (classData) {
      reset({
        class_number: classData.class_number,
        topic: classData.topic,
        class_type: classData.class_type,
        // Array কে টেক্সটএরিয়াতে দেখানোর জন্য নিউলাইন দিয়ে জয়েন করা
        content_details: classData.content_details?.join("\n") || "",
        date_scheduled: classData.date_scheduled ? classData.date_scheduled.split("T")[0] : ""
      });
    }
  }, [classData, reset]);

  const onSubmit = (data) => {
    updateClass({ classId: classData._id, ...data }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-800">Edit Class Information</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Updating: {classData?.class_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-200">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Class ID</label>
              <input {...register("class_number")} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Class Type</label>
              <select {...register("class_type")} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20">
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
                <option value="Exam">Exam</option>
                <option value="Practice Session">Practice Session</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Topic Name</label>
            <input {...register("topic")} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Date (Optional)</label>
            <input type="date" {...register("date_scheduled")} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/20" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase ml-1">Content Details (One per line)</label>
            <textarea {...register("content_details")} rows={4} className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20" placeholder="Enter class details..." />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={isPending} className="flex-1 py-3.5 bg-teal-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> {isPending ? "Saving..." : "Update Class"}
            </button>
            <button 
              type="button" 
              onClick={() => { if(window.confirm("Delete this class?")) { deleteClass(classData._id, { onSuccess: onClose }); } }}
              className="px-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}