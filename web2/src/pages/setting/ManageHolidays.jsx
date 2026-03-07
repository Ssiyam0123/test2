import React, { useState } from "react";
import { useHolidays, useAddHoliday, useDeleteHoliday } from "../../hooks/useHolidays";
import { Trash2, Calendar, Plus } from "lucide-react";
import Swal from "sweetalert2";
import Loader from "../../components/Loader";

export default function ManageHolidays() {
  const { data: holidaysRes, isLoading } = useHolidays();
  const addMutation = useAddHoliday();
  const deleteMutation = useDeleteHoliday();

  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(true); 

const holidays = Array.isArray(holidaysRes) 
  ? holidaysRes 
  : Array.isArray(holidaysRes?.data) 
  ? holidaysRes.data 
  : Array.isArray(holidaysRes?.data?.data) 
  ? holidaysRes.data.data 
  : [];

console.log("Holiday API Response:", holidaysRes);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !selectedDate) return;

    // 🚀 `<input type="date">` থেকে সবসময় "YYYY-MM-DD" ফরম্যাটে ডেটা আসে।
    // যদি Recurring হয়, তাহলে আমরা প্রথম ৫ ক্যারেক্টার (YYYY-) কেটে ফেলবো।
    let finalDateString = selectedDate;
    if (isRecurring) {
      finalDateString = selectedDate.substring(5); // "2026-03-26" -> "03-26"
    }

    // ব্যাকএন্ডে পাঠানোর আগে সেফটি চেক
    const regex = /^(?:\d{4}-)?(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(finalDateString)) {
      Swal.fire({ icon: "error", title: "Invalid Format", text: "Something went wrong with the selected date." });
      return;
    }

    addMutation.mutate({ title, date_string: finalDateString }, {
      onSuccess: () => {
        setTitle("");
        setSelectedDate("");
        setIsRecurring(true); // ফর্ম রিসেট
      }
    });
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: "Remove Holiday?",
      text: `Are you sure you want to remove "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
          <Calendar className="text-teal-600" /> Holiday Calendar Manager
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage public holidays and institute off-days. This affects auto-scheduling.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Add New Holiday</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Holiday Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Independence Day"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Select Date</label>
            {/* 🚀 Date Picker Add করা হলো */}
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-teal-500 outline-none transition-all cursor-pointer"
            />
            {/* 🚀 Recurring Checkbox */}
            <div className="flex items-center gap-2 mt-2 ml-1">
              <input 
                type="checkbox" 
                id="recurring" 
                checked={isRecurring} 
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-3.5 h-3.5 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="recurring" className="text-[11px] font-bold text-gray-500 cursor-pointer select-none">
                Recurs every year (Fixed Date)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={addMutation.isPending}
            className="w-full md:w-auto mt-2 md:mt-0 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={18} /> Add
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
          * Keep the checkbox <b>checked</b> for fixed holidays (e.g., 26th March). <br/>
          * <b>Uncheck</b> it for moon-based holidays (e.g., Eid) so it only applies to the specific selected year.
        </p>
      </div>

      {/* Holiday List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Holiday Title</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.length > 0 ? (
              holidays.map((h) => {
                // 🚀 চেক করা হচ্ছে এটা কি রিপিটিং নাকি এককালীন
                const isYearly = h.date_string.length === 5; // length 5 means "MM-dd"
                
                return (
                  <tr key={h._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-teal-600">{h.date_string}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{h.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${isYearly ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                        {isYearly ? "Yearly" : "One-time"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(h._id, h.title)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">No holidays added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}