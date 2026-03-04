import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, Search, BookOpen, Layers } from "lucide-react";
import {
  useMasterTopics,
  useDeleteMasterSyllabus,
} from "../../hooks/useMasterSyllabus";

// 🚀 IMPORT THE REUSABLE SWAL DELETE UTILITY
import { confirmDelete } from "../../utils/swalUtils"; 

import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import useAuth from "../../store/useAuth"; // 🚀 Zustand Store Import

const CATEGORIES = [
  "Foundations",
  "Continental",
  "Asian",
  "Bakery & Pastry",
  "Middle Eastern",
  "Beverage",
  "Assessment",
  "General",
];

export default function ManageMasterSyllabus() {
  const navigate = useNavigate();
  
  // 🚀 PBAC Dynamic Permission Check
  const { hasPermission } = useAuth();
  const canManageSyllabus = hasPermission("manage_master_syllabus") || hasPermission("manage_syllabus");

  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: res, isLoading } = useMasterTopics({ category, search });
  const deleteMutation = useDeleteMasterSyllabus();

  const syllabusData = res?.data
    ? [...res.data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    : [];

  // 🚀 DYNAMIC DELETE HANDLER WITH SWAL
  const handleDelete = (id, name) => {
    confirmDelete({
      title: "Remove Topic?",
      text: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
      confirmText: "Yes, delete topic",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    { label: "#", align: "center", className: "w-16" }, 
    { label: "Syllabus Topic & Recipes", align: "left" },
    { label: "Category", align: "left" },
    { label: "Type", align: "left" },
    { label: "Actions", align: "right" },
  ];

  const renderRow = (item) => (
    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors group">
      
      <td className="px-6 py-5 text-center">
        <span className="font-mono font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg text-[11px] border border-teal-100">
          {String(item.order_index || 0).padStart(2, "0")}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex flex-col">
          <span className="text-[15px] font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
            {item.topic}
          </span>
          {item.description && (
            <span className="text-[11px] text-slate-400 font-medium mt-1 italic line-clamp-1">
              {item.description}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded-md">
          {item.category || "General"}
        </span>
      </td>

      <td className="px-6 py-5">
        <span
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
            item.class_type === "Lab"
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : "bg-indigo-50 text-indigo-600 border-indigo-100"
          }`}
        >
          {item.class_type || "Lecture"}
        </span>
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex justify-end gap-2">
          {/* 🚀 Role Protected Actions */}
          {canManageSyllabus ? (
            <>
              <button
                onClick={() => navigate(`/admin/update-syllabus/${item._id}`)}
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-transparent hover:border-teal-100 transition-all"
                title="Edit Topic"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item._id, item.topic)}
                disabled={deleteMutation.isPending}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all disabled:opacity-50"
                title="Delete Topic"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
              View Only
            </span>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        title="Master Syllabus Library"
        subtitle="Global blueprint for all batch curricula."
        // 🚀 Role Protected Add Button
        onAdd={canManageSyllabus ? () => navigate("/admin/add-syllabus") : undefined}
        addText={canManageSyllabus ? "Add Topics" : undefined}
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        <div className="md:col-span-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search topics..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:border-teal-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-4">
          <select
            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:border-teal-500 outline-none font-bold text-slate-700 shadow-sm cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={syllabusData}
        renderRow={renderRow}
        isLoading={isLoading}
        searchTerm={search}
        page={page}
        onPageChange={setPage}
        pagination={{ total: syllabusData.length, totalPages: 1 }}
      />
    </div>
  );
}