import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useBatches, useDeleteBatch } from "../../hooks/useBatches"; 
import { useBranches } from "../../hooks/useBranches"; 
import useAuth from "../../store/useAuth"; // 🚀 Zustand Store
import { useConfirmToast } from "../../components/ConfirmToast.jsx"; 

import BatchHeader from "../../components/batches/BatchHeader";
import BatchList from "../../components/batches/BatchList";
import Loader from "../../components/Loader";
import BranchDropdown from "../../components/common/BranchDropdown"; 

export default function ManageBatchesTabs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // 🚀 Zustand Helper Call
  const { isMaster: checkIsMaster } = useAuth();
  const isMaster = checkIsMaster(); 
  
  const context = useOutletContext() || {};
  const { branchId: contextBranchId } = context;

  const [localBranchId, setLocalBranchId] = useState(isMaster ? "all" : contextBranchId);

  useEffect(() => {
    if (!isMaster && contextBranchId) {
      setLocalBranchId(contextBranchId);
    }
  }, [contextBranchId, isMaster]);

  const { data: branchesRes } = useBranches({}, { enabled: isMaster });
  const branches = branchesRes?.data || [];

  const queryFilter = useMemo(() => {
    if (!isMaster) return { branch: contextBranchId };
    return localBranchId !== "all" ? { branch: localBranchId } : {};
  }, [localBranchId, isMaster, contextBranchId]);

  const { showConfirmToast } = useConfirmToast();
  const deleteBatchMutation = useDeleteBatch();

  const { data: batchesResponse, isLoading: batchesLoading } = useBatches(
    queryFilter,
    { enabled: isMaster ? true : !!contextBranchId } 
  );
  
  const batches = batchesResponse?.data || [];

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.course?.course_name && b.course.course_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteBatch = (e, id, batchName) => {
    e.stopPropagation(); 
    showConfirmToast({
      type: "delete",
      title: "Delete Batch",
      message: `Are you sure you want to permanently delete`,
      itemName: batchName,
      confirmText: "Delete",
      confirmColor: "red",
      onConfirm: async () => await deleteBatchMutation.mutateAsync(id),
    });
  };

  if (batchesLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#e8f0f2] p-2 md:p-4 lg:p-8 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] flex gap-4 lg:gap-6 ">
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[1.25rem] md:rounded-[2.5rem] p-3 md:p-6 shadow-sm border border-white/60 overflow-hidden">
          
          <BatchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <BranchDropdown 
            isMaster={isMaster} 
            branches={branches} 
            value={localBranchId} 
            onChange={setLocalBranchId} 
            wrapperClassName="flex justify-end mb-4"
          />

          <BatchList 
            batches={filteredBatches} 
            onSelectBatch={(batch) => navigate(`/admin/batches/${batch._id}`)} 
            onDeleteBatch={handleDeleteBatch}
            isDeleting={deleteBatchMutation.isPending}
          />

        </div>
      </div>
    </div>
  );
}