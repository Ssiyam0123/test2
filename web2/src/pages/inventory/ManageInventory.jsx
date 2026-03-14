import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Plus, PackageSearch, ClipboardList, History, Calculator } from "lucide-react";
import useAuth from "../../store/useAuth";
import { useBranches } from "../../hooks/useBranches"; 

import PantryView from "../../components/inventory/PantryView";
import HisabNikashView from "../../components/inventory/HisabNikashView";
import RequisitionsView from "../../components/inventory/RequisitionsView";
import InventoryHistory from "../inventory/InventoryHistory";
import BranchDropdown from "../../components/common/BranchDropdown"; 
import PermissionGuard from "../../components/common/PermissionGuard"; 
import { PERMISSIONS } from "../../config/permissionConfig";

export default function ManageInventory() {
  const { branchId, branchName } = useOutletContext() || {};
  const { hasPermission, isMaster: checkIsMaster } = useAuth();
  const navigate = useNavigate();
  
  const isSuper = checkIsMaster();

  const [activeTab, setActiveTab] = useState("pantry");
  const [superAdminBranch, setSuperAdminBranch] = useState(""); 
  
  const { data: branches = [] } = useBranches({}, { enabled: !!isSuper });

  useEffect(() => {
    if (isSuper && branches.length > 0 && !superAdminBranch) {
      setSuperAdminBranch(branches[0]._id);
    }
  }, [isSuper, branches, superAdminBranch]);

  const effectiveBranchId = isSuper ? superAdminBranch : branchId;

  const displayBranchName = useMemo(() => {
    if (!isSuper) return branchName;
    if (!superAdminBranch) return "Loading...";
    const selected = branches.find(b => b._id === superAdminBranch);
    return selected ? selected.branch_name : "Loading...";
  }, [isSuper, superAdminBranch, branchName, branches]);

  // 🚀 ট্যাব কন্ট্রোল: রিকুইজিশন দেখার পারমিশন চেক
  const tabs = [
    { id: "pantry", label: "Fast Count", icon: PackageSearch },
    { id: "hisab", label: "Valuation", icon: Calculator },
    { id: "requisitions", label: "Requisitions", icon: ClipboardList, permission: PERMISSIONS.VIEW_INVENTORY },
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
          <PermissionGuard requiredPermission={PERMISSIONS.VIEW_BRANCHES}>
            {isSuper && (
              <BranchDropdown 
                isMaster={isSuper} 
                branches={branches} 
                value={superAdminBranch} 
                onChange={setSuperAdminBranch} 
                showAllOption={false} 
                wrapperClassName="w-full sm:w-auto" 
              />
            )}
          </PermissionGuard>

          {hasPermission(PERMISSIONS.INVENTORY_ADD_STOCK) && (
            <button 
              onClick={() => navigate("/admin/add-inventory")} 
              className="w-full sm:w-auto h-[42px] px-6 bg-teal-600 text-white text-xs font-black uppercase rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
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

      {effectiveBranchId && (
        <div className="animate-in slide-in-from-bottom-2 duration-500">
          {activeTab === "pantry" && <PantryView branchId={effectiveBranchId} />}
          {activeTab === "hisab" && <HisabNikashView branchId={effectiveBranchId} />}
          {activeTab === "requisitions" && <RequisitionsView branchId={effectiveBranchId} />}
          {activeTab === "history" && <InventoryHistory branchId={effectiveBranchId} />}
        </div>
      )}
    </div>
  );
}