import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Calendar, Clock, BookOpen, Edit3, Trash2 } from "lucide-react";
import { useActiveBatches, useDeleteBatch } from "../hooks/useBatches";
import Loader from "../components/Loader";
import Swal from "sweetalert2"; // Recommended for delete confirmations

export default function BatchListPage() {
  const navigate = useNavigate();
  const { data: batchesResponse, isLoading } = useActiveBatches();
  const { mutate: deleteBatch } = useDeleteBatch();
  const [searchTerm, setSearchTerm] = useState("");
  
  const batches = batchesResponse?.data || [];

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the batch and all scheduled classes!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#14b8a6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBatch(id);
      }
    });
  };

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  return (
    <div className="p-6 lg:p-10 bg-[#e8f0f2] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Batch Inventory</h1>
          <button onClick={() => navigate("/admin/add-batch")} className="bg-[#1e293b] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Plus size={20} /> New Batch
          </button>
        </div>

        <div className="bg-white/80 rounded-[2.5rem] overflow-hidden border border-white shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400">Batch Info</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase text-slate-400">Schedule</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase text-slate-400">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((batch) => (
                <tr key={batch._id} className="hover:bg-teal-50/30 transition-colors border-b border-slate-50">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{batch.batch_name}</span>
                      <span className="text-xs text-teal-600 font-bold">{batch.course?.course_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-600">
                    {batch.batch_type} | {batch.time_slot?.start_time}
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-black uppercase">
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/admin/manage-batches?id=${batch._id}`)}
                        className="p-2 text-slate-400 hover:text-teal-600 transition-all"
                      >
                        <BookOpen size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/edit-batch/${batch._id}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(batch._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}