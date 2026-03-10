import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Trash2, Search, BookOpen } from "lucide-react";
import {
  useMasterTopics,
  useDeleteMasterSyllabus,
} from "../../hooks/useMasterSyllabus";

import { confirmDelete } from "../../utils/swalUtils"; 
import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import useAuth from "../../store/useAuth"; 
import { PERMISSIONS } from "../../config/permissionConfig";
import ActionIconButton from "../../components/common/ActionIconButton";

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
  const { hasPermission } = useAuth();
  
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 🚀 গ্র্যানুলার পারমিশন ফ্ল্যাগস
  const canEdit = hasPermission(PERMISSIONS.SYLLABUS_EDIT);
  const canDelete = hasPermission(PERMISSIONS.SYLLABUS_DELETE);
  const hasActionAccess = canEdit || canDelete;

  const { data: topics = [], isLoading } = useMasterTopics({ category, search });
  const deleteMutation = useDeleteMasterSyllabus();

  const syllabusData = [...topics].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

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
    ...(hasActionAccess ? [{ label: "Actions", align: "right" }] : [])
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

      {hasActionAccess && (
        <td className="px-6 py-5 text-right">
          <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            
            {/* 📝 সিলেবাস এডিট পারমিশন */}
            {canEdit && (
              <ActionIconButton 
                icon={Edit3} 
                variant="neutral"
                onClick={() => navigate(`/admin/update-syllabus/${item._id}`)}
                title="Edit Topic"
              />
            )}

            {/* 🗑️ সিলেবাস ডিলিট পারমিশন */}
            {canDelete && (
              <ActionIconButton 
                icon={Trash2} 
                variant="danger"
                onClick={() => handleDelete(item._id, item.topic)}
                disabled={deleteMutation.isPending}
                title="Delete Topic"
              />
            )}
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <PageHeader
        title="Master Syllabus Library"
        subtitle="Global blueprint for all batch curricula."
        onAdd={() => navigate("/admin/add-syllabus")}
        addText="Add Topics"
        // 🚀 গ্র্যানুলার পারমিশন: নতুন টপিক অ্যাড করা এডিটের আন্ডারে
        addPermission={PERMISSIONS.SYLLABUS_EDIT} 
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
        emptyStateIcon={BookOpen}
        emptyStateTitle="No Syllabus Topics Found"
      />
    </div>
  );
}