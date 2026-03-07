import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Plus, PackageSearch, ClipboardList, History, Calculator } from "lucide-react";
import useAuth from "../../store/useAuth";
import { useBranches } from "../../hooks/useBranches"; 

// 🚀 Import Separate Components
import PantryView from "../../components/inventory/PantryView";
import HisabNikashView from "../../components/inventory/HisabNikashView";
import RequisitionsView from "../../components/inventory/RequisitionsView";
import InventoryHistory from "../inventory/InventoryHistory";
import BranchDropdown from "../../components/common/BranchDropdown"; 

export default function ManageInventory() {
  const { branchId, branchName } = useOutletContext() || {};
  const { authUser, hasPermission, isMaster } = useAuth();
  const navigate = useNavigate();
  
  const isSuper = isMaster ? isMaster() : authUser?.role === "superadmin";

  const [activeTab, setActiveTab] = useState("pantry");
  const [superAdminBranch, setSuperAdminBranch] = useState(""); // 🚀 Default empty

  const { data: branchesRes } = useBranches({}, { enabled: !!isSuper });

  // 🚀 Auto-select the first branch for Super Admin when data loads
  useEffect(() => {
    if (isSuper && branchesRes?.data?.length > 0 && !superAdminBranch) {
      setSuperAdminBranch(branchesRes.data[0]._id);
    }
  }, [isSuper, branchesRes, superAdminBranch]);

  // 🚀 Calculate effective branch ID
  const effectiveBranchId = isSuper ? superAdminBranch : branchId;

  const displayBranchName = useMemo(() => {
    if (!isSuper) return branchName;
    if (!superAdminBranch) return "Loading...";
    const selected = branchesRes?.data?.find(b => b._id === superAdminBranch);
    return selected ? selected.branch_name : "Loading...";
  }, [isSuper, superAdminBranch, branchName, branchesRes]);

  const tabs = [
    { id: "pantry", label: "Fast Count", icon: PackageSearch },
    { id: "hisab", label: "Valuation", icon: Calculator },
    { id: "requisitions", label: "Requisitions", icon: ClipboardList, permission: "view_requisitions" },
    { id: "history", label: "History", icon: History },
  ].filter(t => !t.permission || hasPermission(t.permission));

  if (!isSuper && !branchId) return <div className="p-20 text-center font-bold text-slate-400">Please select a branch.</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{displayBranchName} Inventory</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Assets</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* 🚀 BRANCH DROPDOWN (No 'All Campuses' option) */}
          {isSuper && (
            <BranchDropdown 
              isMaster={isSuper} 
              branches={branchesRes?.data || []} 
              value={superAdminBranch} 
              onChange={setSuperAdminBranch} 
              showAllOption={false} // 🚀 HIDDEN THE ALL OPTION HERE
              wrapperClassName="w-full sm:w-auto" 
            />
          )}

          {hasPermission("manage_inventory") && (
            <button onClick={() => navigate("/admin/add-inventory")} className="w-full sm:w-auto h-[42px] px-6 bg-teal-600 text-white text-xs font-black uppercase rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> Log Purchase
            </button>
          )}
        </div>
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

      {/* 🚀 Render components only if we have an effective branch ID */}
      {effectiveBranchId && (
        <>
          {activeTab === "pantry" && <PantryView branchId={effectiveBranchId} />}
          {activeTab === "hisab" && <HisabNikashView branchId={effectiveBranchId} />}
          {activeTab === "requisitions" && <RequisitionsView branchId={effectiveBranchId} />}
          {activeTab === "history" && <InventoryHistory branchId={effectiveBranchId} />}
        </>
      )}
    </div>
  );
}