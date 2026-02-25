import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, BookOpen, Edit3, Trash2, LayoutGrid, Search, Layers } from "lucide-react";
import { useActiveBatches, useDeleteBatch } from "../../hooks/useBatches";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";
import DataTable from "../../components/common/DataTable.jsx";

export default function BatchListPage() {
  const navigate = useNavigate();
  const { data: batchesResponse, isLoading } = useActiveBatches();
  const { mutate: deleteBatch } = useDeleteBatch();
  const [searchTerm, setSearchTerm] = useState("");
  
  const batches = batchesResponse?.data || [];

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Batch?",
      text: "All schedule data and class records will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it",
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl px-6 py-3',
        cancelButton: 'rounded-xl px-6 py-3'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBatch(id);
      }
    });
  };

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: "Batch Details", className: "w-[40%]" },
    { label: "Schedule & Days", className: "hidden md:table-cell w-[30%]" },
    { label: "Status", className: "w-[15%]" },
    { label: "Actions", align: "right", className: "w-[15%]" }
  ];

  const renderBatchRow = (batch) => (
    <tr key={batch._id} className="group transition-colors duration-300 border-b border-slate-50 last:border-none hover:bg-slate-50/50">
      
      {/* 1. Batch Details */}
      <td className="px-6 py-4 align-middle">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-11 w-11 rounded-2xl bg-teal-50 text-teal-600 items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
            <LayoutGrid size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[14px] text-slate-800 truncate">{batch.batch_name}</span>
            <span className="text-[11px] text-teal-600 font-black uppercase tracking-tight truncate mt-0.5">
              {batch.course?.course_name || 'No Course Assigned'}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Schedule & Days */}
      <td className="hidden md:table-cell px-6 py-4 align-middle">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
            <Clock size={13} className="text-teal-500" />
            <span>{batch.time_slot?.start_time} - {batch.time_slot?.end_time}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {batch.schedule_days?.map(day => (
              <span key={day} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-500 rounded uppercase">
                {day.substring(0, 3)}
              </span>
            ))}
          </div>
        </div>
      </td>

      {/* 3. Status */}
      <td className="px-6 py-4 align-middle">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
          batch.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          batch.status === 'Upcoming' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
          'bg-slate-100 text-slate-500 border border-slate-200'
        }`}>
          {batch.status}
        </span>
      </td>

      {/* 4. Actions */}
      <td className="px-6 py-4 text-right align-middle">
        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => navigate(`/admin/manage-batches?id=${batch._id}`)}
            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
            title="Manage Workspace"
          >
            <BookOpen size={16} />
          </button>
          <button 
            onClick={() => navigate(`/admin/edit-batch/${batch._id}`)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Edit Settings"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(batch._id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Delete Batch"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isLoading) return <Loader />;

  return (
    <div className="p-4 md:p-8 lg:p-10 bg-[#e8f0f2] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Batch Inventory</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Total {batches.length} batches active in system</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-transparent focus:border-teal-500 rounded-2xl outline-none shadow-sm transition-all text-sm font-medium"
              />
            </div>
            <button 
              onClick={() => navigate("/admin/add-batch")} 
              className="bg-[#1e293b] hover:bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
            >
              <Plus size={20} /> <span className="hidden sm:inline">New Batch</span>
            </button>
          </div>
        </div>

        {/* DataTable Integration */}
        <DataTable
          columns={columns}
          data={filteredBatches}
          renderRow={renderBatchRow}
          isLoading={isLoading}
          searchTerm={searchTerm}
          emptyStateIcon={Layers}
          emptyStateTitle="No batches found"
          emptyStateSubtitle="There are no batches matching your search or currently active in the system."
        />
        
      </div>
    </div>
  );
}