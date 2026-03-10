import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Plus,
  Trash2,
  Calculator,
  ArrowLeft,
  Store,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EntityForm from "../../components/common/EntityForm";
import { useAddStockPurchase } from "../../hooks/useInventory";
import { useBranches } from "../../hooks/useBranches";
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader";
import BranchDropdown from "../../components/common/BranchDropdown";
import { toast } from "react-hot-toast";
import { PERMISSIONS } from "../../config/permissionConfig"; // 🚀 Import Permissions
import PermissionGuard from "../../components/common/PermissionGuard"; // 🚀 Import Guard

const CATEGORIES = [
  "Meat",
  "Dairy",
  "Produce",
  "Dry Goods",
  "Equipment",
  "Packaging",
  "Other",
];
const UNITS = ["kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen"];

// --- DynamicStockField Component ---
const DynamicStockField = ({ value = [], onChange }) => {
  const handleAddItem = () => {
    onChange([
      ...value,
      { name: "", category: "", qty: "", unit: "kg", rowTotal: "" },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (value.length > 1) {
      onChange(value.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...value];
    newItems[index][field] = val;
    onChange(newItems);
  };

  const grandTotal = useMemo(
    () => value.reduce((sum, item) => sum + (Number(item.rowTotal) || 0), 0),
    [value],
  );

  return (
    <div className="w-full bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600 rounded-2xl text-white shadow-lg shadow-teal-200">
            <Package size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            Purchase Line Items
          </h3>
        </div>
        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">
              Total Amount
            </span>
            <span className="text-xl font-black text-teal-600">
              ৳{grandTotal.toLocaleString()}
            </span>
          </div>
          <Calculator size={20} className="text-slate-300" />
        </div>
      </div>

      <div className="p-6 overflow-x-auto custom-scrollbar">
        <div className="space-y-4 min-w-[850px]">
          {/* Header */}
          <div className="flex gap-4 px-2">
            <label className="flex-[2.5] text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Product Description
            </label>
            <label className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Category
            </label>
            <label className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Qty
            </label>
            <label className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Unit
            </label>
            <label className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
              Row Total (৳)
            </label>
            <div className="w-10"></div>
          </div>

          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group animate-in fade-in slide-in-from-top-1"
            >
              <input
                type="text"
                required
                value={item.name}
                onChange={(e) => handleItemChange(index, "name", e.target.value)}
                placeholder="Item name..."
                className="flex-[2.5] px-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-teal-500 outline-none transition-all"
              />
              <select
                required
                value={item.category}
                onChange={(e) => handleItemChange(index, "category", e.target.value)}
                className="flex-1 px-3 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-teal-500 outline-none appearance-none"
              >
                <option value="" disabled>Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={item.qty}
                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                placeholder="0"
                className="w-24 px-2 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-center outline-none focus:border-teal-500 focus:bg-white"
              />
              <select
                required
                value={item.unit}
                onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                className="w-24 px-2 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-center outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <input
                type="number"
                required
                min="0"
                value={item.rowTotal}
                onChange={(e) => handleItemChange(index, "rowTotal", e.target.value)}
                placeholder="0.00"
                className="w-32 px-4 py-3.5 bg-slate-100/50 border-2 border-slate-100 rounded-2xl text-sm font-black text-right text-teal-700 outline-none focus:bg-white focus:border-teal-500"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50 px-6 py-4 rounded-2xl border-2 border-dashed border-teal-100 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add Item to Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function AddInventory() {
  const navigate = useNavigate();
  const { authUser, isMaster: checkMaster, hasPermission } = useAuth();
  const isSuper = checkMaster();

  const [selectedBranch, setSelectedBranch] = useState("");
  const { data: branches = [] } = useBranches({}, { enabled: !!isSuper });

  useEffect(() => {
    if (isSuper && branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]._id);
    } else if (!isSuper && authUser?.branch) {
      const bId = typeof authUser.branch === "object" ? authUser.branch._id : authUser.branch;
      setSelectedBranch(bId);
    }
  }, [isSuper, branches, authUser, selectedBranch]);

  const addStockMutation = useAddStockPurchase(selectedBranch);

  const handleSubmit = async (formDataObj, rawFormData) => {
    const { items, supplier, notes } = rawFormData;
    if (!selectedBranch) return toast.error("Please select a target branch");

    const payload = {
      items: items.map((i) => ({
        item_name: i.name,
        category: i.category,
        quantity: Number(i.qty),
        unit: i.unit,
        total_price: Number(i.rowTotal),
      })),
      total_cost: items.reduce((sum, item) => sum + (Number(item.rowTotal) || 0), 0),
      supplier: supplier || "Direct Purchase",
      notes: notes || "",
      branch: selectedBranch,
    };

    try {
      await addStockMutation.mutateAsync(payload);
      toast.success("Inventory updated successfully!");
      navigate("/admin/inventory");
    } catch (error) {}
  };

  const formConfig = [
    {
      name: "items",
      type: "custom",
      fullWidth: true,
      render: ({ value, onChange }) => (
        <DynamicStockField value={value || []} onChange={onChange} />
      ),
    },
    { divider: true, title: "Transaction Details", icon: FileText },
    {
      name: "supplier",
      label: "Vendor / Store",
      type: "text",
      placeholder: "Vendor name...",
      icon: Store,
    },
    {
      name: "notes",
      label: "Transaction Reference",
      type: "text",
      placeholder: "e.g. Bazar for Batch 14",
      fullWidth: true,
    },
  ];

  if (!selectedBranch && !isSuper) return <div className="h-screen flex justify-center items-center"><Loader /></div>;

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-[0.2em] mb-6 transition-all group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Inventory
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Log Stock Purchase</h1>
            <p className="text-slate-500 text-sm font-bold mt-2">Record arrival of ingredients and auto-update stock levels.</p>
          </div>

          {/* 🚀 ব্রাঞ্চ ড্রপডাউন পারমিশন চেক */}
          <PermissionGuard requiredPermission={PERMISSIONS.VIEW_BRANCHES}>
            {isSuper && (
              <BranchDropdown
                isMaster={isSuper}
                branches={branches}
                value={selectedBranch}
                onChange={setSelectedBranch}
                showAllOption={false}
                wrapperClassName="w-full md:w-64"
              />
            )}
          </PermissionGuard>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <EntityForm
            config={formConfig}
            initialData={{
              items: [{ name: "", category: "", qty: "", unit: "kg", rowTotal: "" }],
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/inventory")}
            isLoading={addStockMutation.isPending}
            buttonText="Post to Inventory & Ledger"
            buttonColor="bg-slate-900 hover:bg-teal-600"
            gridCols="grid-cols-1 md:grid-cols-2"
          />
        </div>
      </div>
    </div>
  );
}