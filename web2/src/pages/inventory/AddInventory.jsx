import React, { useState, useEffect } from "react";
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
import { useBranches } from "../../hooks/useBranches"; // 🚀 Added
import useAuth from "../../store/useAuth";
import Loader from "../../components/Loader";
import BranchDropdown from "../../components/common/BranchDropdown"; // 🚀 Added

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

// ... DynamicStockField component (Keep as it is) ...
const DynamicStockField = ({ value = [], onChange }) => {
  const handleAddItem = () => {
    onChange([
      ...value,
      { name: "", category: "", qty: "", unit: "kg", rowTotal: "" },
    ]);
  };

  const handleRemoveItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, val) => {
    const newItems = [...value];
    newItems[index][field] = val;
    onChange(newItems);
  };

  const grandTotal = value.reduce(
    (sum, item) => sum + (Number(item.rowTotal) || 0),
    0,
  );

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
            <Package size={20} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
            Purchase Line Items
          </h3>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <Calculator size={16} className="text-teal-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
            Running Total:
          </span>
          <span className="text-base font-black text-teal-600">
            ৳{grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="p-4 lg:p-6 overflow-x-auto custom-scrollbar">
        <div className="space-y-3 min-w-[800px]">
          {/* Header Labels */}
          <div className="flex gap-3 px-2 mb-1">
            <label className="flex-[2] text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Product Description
            </label>
            <label className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Category
            </label>
            <label className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Quantity
            </label>
            <label className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              Unit
            </label>
            <label className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
              Price (৳)
            </label>
            <div className="w-10"></div>
          </div>

          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <input
                type="text"
                required
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                placeholder="e.g. Fresh Chicken Breast"
                className="flex-[2] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 outline-none transition-all"
              />

              <select
                required
                value={item.category}
                onChange={(e) =>
                  handleItemChange(index, "category", e.target.value)
                }
                className="flex-1 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white outline-none cursor-pointer transition-all"
              >
                <option value="" disabled>
                  Select...
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <input
                type="number"
                required
                min="0.01"
                step="any"
                value={item.qty}
                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                placeholder="0.00"
                className="w-24 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white outline-none text-center transition-all"
              />

              <select
                required
                value={item.unit}
                onChange={(e) =>
                  handleItemChange(index, "unit", e.target.value)
                }
                className="w-24 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white outline-none cursor-pointer transition-all"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              <input
                type="number"
                required
                min="0"
                step="any"
                value={item.rowTotal}
                onChange={(e) =>
                  handleItemChange(index, "rowTotal", e.target.value)
                }
                placeholder="0.00"
                className="w-32 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:bg-white outline-none text-right transition-all"
              />

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={value.length === 1}
                className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-6 mt-4">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center justify-center gap-2 text-xs font-black text-teal-600 bg-teal-50 hover:bg-teal-100 px-5 py-3 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <Plus size={16} strokeWidth={3} /> Add New Row
            </button>
            <div className="text-right pr-12">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Grand Total Amount
              </span>
              <span className="text-3xl font-black text-slate-800 tracking-tighter">
                ৳{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddInventory() {
  const navigate = useNavigate();
  const { authUser, isMaster } = useAuth();

  // 🚀 Logic to determine if user is super admin
  const isSuper = isMaster ? isMaster() : authUser?.role === "superadmin";

  // 🚀 Local state for branch selection (for Super Admin)
  const [selectedBranch, setSelectedBranch] = useState("");

  // 🚀 Fetch branches for dropdown
  const { data: branchesRes } = useBranches({}, { enabled: !!isSuper });

  // 🚀 Set default branch on load
  useEffect(() => {
    if (isSuper && branchesRes?.data?.length > 0 && !selectedBranch) {
      setSelectedBranch(branchesRes.data[0]._id);
    } else if (!isSuper) {
      const branchId =
        typeof authUser?.branch === "object"
          ? authUser?.branch?._id
          : authUser?.branch;
      setSelectedBranch(branchId);
    }
  }, [isSuper, branchesRes, authUser, selectedBranch]);

  // Use the selected branch for the mutation
  const addStockMutation = useAddStockPurchase(selectedBranch);

  if (!selectedBranch && !isSuper) {
    return (
      <div className="h-screen bg-[#e8f0f2] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const formConfig = [
    {
      name: "items",
      type: "custom",
      fullWidth: true,
      render: ({ value, onChange }) => (
        <DynamicStockField value={value || []} onChange={onChange} />
      ),
    },
    { divider: true, title: "Invoice & Logistics", icon: FileText },
    {
      name: "supplier",
      label: "Shop / Vendor Name",
      type: "text",
      placeholder: "e.g. Karwan Bazar Wholesale",
      required: false,
      icon: Store,
    },
    {
      name: "notes",
      label: "Reference / Internal Notes",
      type: "text",
      placeholder: "Describe what this bazar is for...",
      fullWidth: true,
    },
  ];

  const handleSubmit = async (formDataObj, rawFormData) => {
    const { items, supplier, notes } = rawFormData;
    const total_cost = items.reduce(
      (acc, curr) => acc + (Number(curr.rowTotal) || 0),
      0,
    );

    const payload = {
      items: items.map((i) => ({
        item_name: i.name,
        category: i.category,
        quantity: Number(i.qty),
        unit: i.unit,
        total_price: Number(i.rowTotal),
      })),
      total_cost,
      supplier: supplier || "",
      notes,
      branch: selectedBranch, // 🚀 Uses the state value (can be changed by Super Admin)
    };

    try {
      await addStockMutation.mutateAsync(payload);
      navigate("/admin/inventory");
    } catch (error) {
      console.error("Stock addition failed", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-[0.2em] mb-4 transition-all w-fit group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />{" "}
              Back to Pantry
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Log Stock Purchase
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Record new inventory arrival and update financial ledger records.
            </p>
          </div>

          {/* 🚀 SUPER ADMIN BRANCH SELECTOR */}
          {isSuper && (
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Target Campus
              </span>
              <BranchDropdown
                isMaster={isSuper}
                branches={branchesRes?.data || []}
                value={selectedBranch}
                onChange={setSelectedBranch}
                showAllOption={false}
                wrapperClassName="w-full md:w-64"
              />
            </div>
          )}
        </div>

        {/* FORM CONTAINER */}
        <div className="p-4 md:p-8">
          <EntityForm
            config={formConfig}
            initialData={{
              items: [
                { name: "", category: "", qty: "", unit: "kg", rowTotal: "" },
              ],
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/admin/inventory")}
            isLoading={addStockMutation.isPending}
            buttonText="Post to Inventory & Ledger"
            buttonColor="bg-slate-900 hover:bg-teal-600 shadow-xl shadow-slate-900/10"
            gridCols="grid-cols-1 md:grid-cols-2"
          />
        </div>
      </div>
    </div>
  );
}
