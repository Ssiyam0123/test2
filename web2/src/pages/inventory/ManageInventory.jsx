import React, { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Building2,
  MapPin,
  PackageSearch,
  Plus,
  Search,
  Calculator,
  ArrowDownRight,
  ArrowUpRight,
  Beef,
  Milk,
  Carrot,
  PackageOpen,
  Wrench,
  Box,
  HelpCircle,
  History,
  ClipboardList,
  CheckCircle2,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";

import AddStockModal from "../../components/inventory/AddStockModal";
import { useBranches } from "../../hooks/useBranches";
// ManageInventory.jsx এর উপরে ইমপোর্টগুলো এরকম হবে:
import {
  useBranchInventory,
  useBranchTransactions,
} from "../../hooks/useInventory";
import {
  usePendingRequisitions,
  useFulfillRequisition,
  useRejectRequisition,
} from "../../hooks/useRequisitions"; 

import Loader from "../../components/Loader";
import toast from "react-hot-toast";

// 🚀 IMPORT AUTH HOOK
import useAuth from "../../store/useAuth";

// ==========================================
// UTILITY: INDUSTRY STANDARD ICONS
// ==========================================
const getCategoryIcon = (category) => {
  const iconProps = { size: 18, className: "text-slate-500" };
  switch (category) {
    case "Meat":
      return <Beef {...iconProps} className="text-rose-500" />;
    case "Dairy":
      return <Milk {...iconProps} className="text-blue-500" />;
    case "Produce":
      return <Carrot {...iconProps} className="text-orange-500" />;
    case "Dry Goods":
      return <PackageOpen {...iconProps} className="text-amber-600" />;
    case "Equipment":
      return <Wrench {...iconProps} className="text-slate-600" />;
    case "Packaging":
      return <Box {...iconProps} className="text-indigo-500" />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};

// ==========================================
// VIEW 1: PANTRY (FAST COUNT)
// ==========================================
const PantryView = ({ branchId }) => {
  const { data: inventoryResponse, isLoading } = useBranchInventory(branchId);
  const inventory = inventoryResponse?.data || [];

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-700">
        <PackageSearch size={20} />
        <h2 className="text-base font-black uppercase tracking-widest">
          Physical Stock Count
        </h2>
      </div>
      <div className="overflow-auto custom-scrollbar max-h-[600px]">
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 p-12">
            <PackageSearch size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">Pantry is empty</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Item Name
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                  In Stock
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-4 font-bold text-slate-800 capitalize">
                    {item.item_name}
                  </td>
                  <td className="p-4 text-right font-black text-slate-700">
                    {item.quantity_in_stock}{" "}
                    <span className="text-xs text-slate-400">{item.unit}</span>
                  </td>
                  <td className="p-4 text-center">
                    {item.quantity_in_stock <= (item.reorder_threshold || 5) ? (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-lg">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ==========================================
// VIEW 2: HISAB NIKASH (FINANCIAL VALUATION)
// ==========================================
const HisabNikashView = ({ branchId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const { data: invRes, isLoading: invLoading } = useBranchInventory(branchId);
  const { data: txnRes, isLoading: txnLoading } =
    useBranchTransactions(branchId);

  const { valuationData, kpis } = useMemo(() => {
    const inventory = invRes?.data || [];
    const transactions = txnRes?.data || [];

    const latestPrices = {};
    transactions.forEach((txn) => {
      if (txn.transaction_type === "PURCHASE" && txn.inventory_item) {
        const itemId =
          typeof txn.inventory_item === "object"
            ? txn.inventory_item._id
            : txn.inventory_item;
        if (!latestPrices[itemId] && txn.quantity > 0) {
          latestPrices[itemId] = txn.total_cost / txn.quantity;
        }
      }
    });

    let totalPantryValue = 0;
    const enrichedInventory = inventory.map((item) => {
      const unitPrice = latestPrices[item._id] || 0;
      const stockValue = item.quantity_in_stock * unitPrice;
      totalPantryValue += stockValue;

      return {
        ...item,
        estimated_unit_price: unitPrice,
        total_value: stockValue,
      };
    });

    const filtered = enrichedInventory.filter((item) => {
      const matchesSearch = item.item_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => b.total_value - a.total_value);

    return { valuationData: filtered, kpis: { totalValue: totalPantryValue } };
  }, [invRes, txnRes, searchTerm, filterCategory]);

  if (invLoading || txnLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-6">
        <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Asset Value
          </p>
          <h3 className="text-2xl font-black text-teal-700">
            ৳
            {kpis.totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:border-teal-500 transition-colors"
          >
            {[
              "All",
              "Meat",
              "Dairy",
              "Produce",
              "Dry Goods",
              "Equipment",
              "Packaging",
              "Other",
            ].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <tr>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Product Details
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Qty in Stock
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Est. Unit Price
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Total Asset Value
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {valuationData.map((item) => {
                const isLowStock =
                  item.quantity_in_stock <= (item.reorder_threshold || 5);
                const hasValue = item.total_value > 0;

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 capitalize">
                            {item.item_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <p className="text-sm font-black text-slate-700">
                        {item.quantity_in_stock}{" "}
                        <span className="text-xs text-slate-400 font-bold">
                          {item.unit}
                        </span>
                      </p>
                    </td>
                    <td className="p-5 text-right">
                      <p className="text-sm font-bold text-slate-500">
                        {item.estimated_unit_price > 0
                          ? `৳${item.estimated_unit_price.toFixed(2)}`
                          : "—"}
                      </p>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasValue && (
                          <Calculator size={14} className="text-teal-500/50" />
                        )}
                        <p
                          className={`text-sm font-black ${hasValue ? "text-teal-700" : "text-slate-400"}`}
                        >
                          {hasValue
                            ? `৳${item.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : "৳0.00"}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${isLowStock ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                      >
                        {isLowStock ? (
                          <>
                            <ArrowDownRight size={12} strokeWidth={3} /> Reorder
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={12} strokeWidth={3} /> Optimal
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VIEW 3: TRANSACTION HISTORY
// ==========================================
const HistoryView = ({ branchId }) => {
  const { data: txnRes, isLoading } = useBranchTransactions(branchId);
  const transactions = txnRes?.data || [];

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-slate-700">
        <ArrowRightLeft size={20} />
        <h2 className="text-base font-black uppercase tracking-widest">
          Stock Ledger (IN/OUT)
        </h2>
      </div>
      <div className="overflow-auto custom-scrollbar max-h-[600px]">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 p-12">
            <History size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">No transactions yet</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10 shadow-sm border-b border-slate-100">
              <tr>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Date & Time
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Type
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                  Item
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                  Qty Change
                </th>
                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                  User / Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((txn) => {
                const isPurchase = txn.transaction_type === "PURCHASE";
                return (
                  <tr
                    key={txn._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(txn.createdAt).toLocaleDateString("en-GB")}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(txn.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${isPurchase ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {isPurchase ? "Stock IN" : "Stock OUT"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 capitalize">
                      {txn.inventory_item?.item_name || "Unknown"}
                    </td>
                    <td className="p-4 text-right">
                      <p
                        className={`text-sm font-black ${isPurchase ? "text-teal-600" : "text-amber-600"}`}
                      >
                        {isPurchase ? "+" : ""}
                        {txn.quantity}{" "}
                        <span className="text-xs opacity-70">
                          {txn.inventory_item?.unit}
                        </span>
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-700">
                        {txn.performed_by?.full_name || "System"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">
                        {isPurchase
                          ? txn.supplier || "Supplier"
                          : txn.reference_class?.topic || "Class Usage"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ==========================================
// VIEW 4: REQUISITIONS (PENDING + HISTORY)
// ==========================================
const RequisitionsView = ({ branchId }) => {
  const { authUser } = useAuth();

  // 🚀 Fetch all requisitions
  const { data: reqRes, isLoading } = usePendingRequisitions(branchId);
  const allRequisitions = reqRes?.data || [];

  // 🚀 Split Data
  const pendingReqs = allRequisitions.filter((r) => r.status === "pending");
  const historyReqs = allRequisitions.filter((r) => r.status !== "pending");

  const fulfillMutation = useFulfillRequisition(branchId);
  const rejectMutation = useRejectRequisition(branchId);
  const [actualCosts, setActualCosts] = useState({});

  // PBAC LOGIC
  const roleName = (
    typeof authUser?.role === "string"
      ? authUser.role
      : authUser?.role?.name || ""
  ).toLowerCase();
  const permissions =
    authUser?.permissions || authUser?.role?.permissions || [];
  const hasInventoryAccess =
    roleName === "superadmin" ||
    roleName === "admin" ||
    permissions.includes("all_access") ||
    permissions.includes("manage_inventory");

  if (isLoading)
    return (
      <div className="py-20 flex justify-center">
        <Loader />
      </div>
    );

  const handleApprove = async (reqId) => {
    const cost = Number(actualCosts[reqId] || 0); // Cost optional if total cost is 0
    await fulfillMutation.mutateAsync({ reqId, actual_cost: cost });
    setActualCosts((prev) => ({ ...prev, [reqId]: "" }));
  };

  const handleReject = async (reqId) => {
    if (window.confirm("Are you sure you want to reject this requisition?")) {
      await rejectMutation.mutateAsync(reqId);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-300 flex flex-col xl:flex-row">
      {/* 🟢 LEFT PANEL: PENDING REQUESTS */}
      <div className="flex-1 xl:border-r border-slate-100">
        <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <ClipboardList size={20} />
            <h2 className="text-base font-black uppercase tracking-widest">
              Pending Requests ({pendingReqs.length})
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          {pendingReqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-slate-400 py-12">
              <CheckCircle2
                size={64}
                className="mb-4 opacity-20 text-emerald-500"
              />
              <p className="text-lg font-bold">All caught up!</p>
            </div>
          ) : (
            pendingReqs.map((req) => (
              <div
                key={req._id}
                className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm hover:border-amber-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {req.class_content?.topic || "Custom Request"}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Requested by:{" "}
                      <span className="text-indigo-600">
                        {req.requested_by?.full_name || "Unknown"}
                      </span>
                    </p>
                    {req.budget > 0 && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                        Est. Budget: ৳{req.budget}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {hasInventoryAccess && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                          ৳
                        </span>
                        <input
                          type="number"
                          placeholder="Cost"
                          value={actualCosts[req._id] || ""}
                          onChange={(e) =>
                            setActualCosts({
                              ...actualCosts,
                              [req._id]: e.target.value,
                            })
                          }
                          className="w-24 pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => handleReject(req._id)}
                        disabled={rejectMutation.isPending}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleApprove(req._id)}
                        disabled={fulfillMutation.isPending}
                        className="px-4 py-2 bg-emerald-500 text-white text-[11px] font-black uppercase rounded-xl hover:bg-emerald-600 shadow-sm shadow-emerald-200 flex gap-1"
                      >
                        {fulfillMutation.isPending ? (
                          <Loader size={14} color="white" />
                        ) : (
                          "Approve"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="flex flex-wrap gap-2">
                  {req.items?.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 capitalize"
                    >
                      {item.item_name}{" "}
                      <span className="text-amber-600 ml-1.5">
                        {item.quantity} {item.unit}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔴 RIGHT PANEL: REQUISITION HISTORY */}
      <div className="w-full xl:w-[400px] bg-slate-50/50 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-slate-700 bg-white">
          <History size={20} />
          <h2 className="text-base font-black uppercase tracking-widest">
            History
          </h2>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar max-h-[600px]">
          {historyReqs.length === 0 ? (
            <p className="text-center text-slate-400 font-bold py-8">
              No history available.
            </p>
          ) : (
            historyReqs.map((req) => (
              <div
                key={req._id}
                className="p-4 border border-slate-200 rounded-2xl bg-white opacity-90 hover:opacity-100 transition-opacity"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-700 leading-tight">
                      {req.class_content?.topic || "Class Requisition"}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(req.updatedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${req.status === "fulfilled" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* 🚀 Accountable Persons */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                      Requested By
                    </p>
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {req.requested_by?.full_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                      Approved By
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 truncate">
                      {req.approved_by?.full_name || "System"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MASTER: BRANCH DASHBOARD CONTROLLER
// ==========================================
const BranchInventoryDashboard = ({ branch }) => {
  const { authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("pantry");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // PBAC LOGIC
  const roleName = (
    typeof authUser?.role === "string"
      ? authUser.role
      : authUser?.role?.name || ""
  ).toLowerCase();
  const permissions =
    authUser?.permissions || authUser?.role?.permissions || [];
  const hasInventoryAccess =
    roleName === "superadmin" ||
    roleName === "admin" ||
    permissions.includes("all_access") ||
    permissions.includes("manage_inventory");

  const tabs = [
    { id: "pantry", label: "Fast Count" },
    { id: "hisab", label: "Valuation" },
    { id: "requisitions", label: "Requisitions" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {branch.branch_name} Inventory
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Manage pantry and assets
          </p>
        </div>

        {hasInventoryAccess && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-teal-600 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Log Purchase
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-full max-w-2xl mb-6 border border-slate-200/60 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pantry" && <PantryView branchId={branch._id} />}
      {activeTab === "hisab" && <HisabNikashView branchId={branch._id} />}
      {activeTab === "history" && <HistoryView branchId={branch._id} />}
      {activeTab === "requisitions" && (
        <RequisitionsView branchId={branch._id} />
      )}

      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        branchId={branch._id}
      />
    </div>
  );
};

// ==========================================
// ROOT COMPONENT
// ==========================================
export default function ManageInventory() {
  const context = useOutletContext() || {};
  const { branchId } = context;

  const { data: branchRes, isLoading } = useBranches();

  const activeBranch = useMemo(() => {
    if (!branchId || !branchRes?.data) return null;
    return (
      branchRes.data.find((b) => b._id === branchId) || {
        _id: branchId,
        branch_name: "Campus",
      }
    );
  }, [branchId, branchRes]);

  if (!branchId || isLoading || !activeBranch) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-8 max-w-7xl mx-auto">
      <BranchInventoryDashboard branch={activeBranch} />
    </div>
  );
}
