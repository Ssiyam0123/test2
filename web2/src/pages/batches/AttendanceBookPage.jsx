import React, { useState, useEffect, useMemo } from "react";
import { ClipboardCheck, Layers } from "lucide-react";
import useAuth from "../../store/useAuth";
import { useBatches } from "../../hooks/useBatches";
import { useBatchClasses } from "../../hooks/useClasses";
import { useBranches } from "../../hooks/useBranches";
import BranchDropdown from "../../components/common/BranchDropdown";
import Loader from "../../components/Loader";
import AttendanceBook from "./AttendanceBook";

export default function AttendanceBookPage() {
  const { authUser, isMaster: checkMaster } = useAuth();
  const isSuper = checkMaster();

  const [selectedBranch, setSelectedBranch] = useState(
    !isSuper ? authUser?.branch?._id || authUser?.branch : "",
  );
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: branches = [] } = useBranches({}, { enabled: !!isSuper });
  const { data: batchesRes, isLoading: batchesLoading } = useBatches(
    selectedBranch ? { branch: selectedBranch } : {},
  );
  const batches = useMemo(() => batchesRes?.data || [], [batchesRes]);

  const { data: classesRes, isLoading: classesLoading } =
    useBatchClasses(selectedBatchId);
  const classes = useMemo(
    () => (Array.isArray(classesRes) ? classesRes : []),
    [classesRes],
  );

  useEffect(() => {
    if (batches.length > 0) {
      const exists = batches.find((b) => b._id === selectedBatchId);
      if (!exists) setSelectedBatchId(batches[0]._id);
    } else {
      setSelectedBatchId("");
    }
  }, [batches, selectedBranch, selectedBatchId]);

  const selectedBatch = useMemo(
    () => batches.find((b) => b._id === selectedBatchId),
    [batches, selectedBatchId],
  );

  return (
    <div className="p-4 md:p-8 lg:p-10 bg-[#f1f5f9] min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER & FILTERS */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-100">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight italic">
                Attendance Ledger
              </h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                Student engagement history
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isSuper && (
              <BranchDropdown
                isMaster={isSuper}
                branches={branches}
                value={selectedBranch}
                onChange={setSelectedBranch}
                showAllOption={false}
                wrapperClassName="w-full sm:w-56 mb-0 mr-10"
              />
            )}
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
            >
              {batchesLoading ? (
                <option>Loading...</option>
              ) : batches.length === 0 ? (
                <option>No batches</option>
              ) : (
                batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batch_name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* MAIN AREA */}
        {classesLoading ? (
          <div className="h-[400px] flex items-center justify-center bg-white rounded-[2rem]">
            <Loader />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-[2rem] text-center border border-slate-200">
            <Layers size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-400">NO BATCH DATA</h3>
          </div>
        ) : (
          <AttendanceBook batch={selectedBatch} classes={classes} />
        )}
      </div>
    </div>
  );
}
