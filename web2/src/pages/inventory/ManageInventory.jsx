import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Plus, PackageSearch, ClipboardList, History, Calculator } from "lucide-react";
import useAuth from "../../store/useAuth";

// 🚀 Import Separate Components
import PantryView from "../../components/inventory/PantryView";
import HisabNikashView from "../../components/inventory/HisabNikashView";
import RequisitionsView from "../../components/inventory/RequisitionsView";
import InventoryHistory from "../inventory/InventoryHistory";

export default function ManageInventory() {
  const { branchId, branchName } = useOutletContext() || {};
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pantry");

  const tabs = [
    { id: "pantry", label: "Fast Count", icon: PackageSearch },
    { id: "hisab", label: "Valuation", icon: Calculator },
    { id: "requisitions", label: "Requisitions", icon: ClipboardList, permission: "view_requisitions" },
    { id: "history", label: "History", icon: History },
  ].filter(t => !t.permission || hasPermission(t.permission));

  if (!branchId) return <div className="p-20 text-center font-bold text-slate-400">Please select a branch.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{branchName} Inventory</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Assets</p>
        </div>
        {hasPermission("manage_inventory") && (
          <button onClick={() => navigate("/admin/add-inventory")} className="px-6 py-3 bg-teal-600 text-white text-xs font-black uppercase rounded-xl hover:bg-teal-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Log Purchase
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit mb-8 border border-slate-200">
        {tabs.map(tab => (
          <button 
            key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pantry" && <PantryView branchId={branchId} />}
      {activeTab === "hisab" && <HisabNikashView branchId={branchId} />}
      {activeTab === "requisitions" && <RequisitionsView branchId={branchId} />}
      {activeTab === "history" && <InventoryHistory branchId={branchId} />}
    </div>
  );
}