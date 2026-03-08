import React, { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useBatches, useDeleteBatch } from "../../hooks/useBatches"; 
import { useBranches } from "../../hooks/useBranches"; 
import useAuth from "../../store/useAuth";
import { useConfirmToast } from "../../components/ConfirmToast.jsx"; 
import BatchHeader from "../../components/batches/BatchHeader";
import BatchCard from "../../components/batches/BatchCard.jsx";
import Loader from "../../components/Loader";
import BranchDropdown from "../../components/common/BranchDropdown"; 

export default function ManageBatchesTabs() {
  const navigate = useNavigate();
  const { isMaster: checkMaster } = useAuth();
  const isMaster = checkMaster();
  const { branchId: contextBranchId } = useOutletContext() || {};

  const [localBranchId, setLocalBranchId] = useState(isMaster ? "all" : contextBranchId);
  const { data: branches = [] } = useBranches({}, { enabled: isMaster });

  const queryFilter = useMemo(() => {
    if (!isMaster) return { branch: contextBranchId };
    return localBranchId !== "all" ? { branch: localBranchId } : {};
  }, [localBranchId, isMaster, contextBranchId]);

  const { data: batchesRes, isLoading } = useBatches(queryFilter);
  const { showConfirmToast } = useConfirmToast();
  const deleteBatchMutation = useDeleteBatch();
  const batches = batchesRes?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loader />;

  return (
    <div className="p-4 md:p-8 bg-[#e8f0f2] min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <BatchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {isMaster && <BranchDropdown isMaster={isMaster} branches={branches} value={localBranchId} onChange={setLocalBranchId} wrapperClassName="flex justify-end mb-4" />}

        <BatchCard 
          batches={filteredBatches} 
          onSelectBatch={(batch) => navigate(`/admin/batches/${batch._id}`)} 
          onDeleteBatch={(e, id, name) => {
            e.stopPropagation();
            showConfirmToast({ type: "delete", itemName: name, onConfirm: () => deleteBatchMutation.mutate(id) });
          }}
          isDeleting={deleteBatchMutation.isPending}
        />
      </div>
    </div>
  );
}