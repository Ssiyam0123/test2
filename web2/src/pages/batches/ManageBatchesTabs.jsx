// src/pages/batches/ManageBatchesTabs.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveBatches } from "../../hooks/useBatches";
import useAuth from "../../store/useAuth";

import BatchHeader from "../../components/batches/BatchHeader";
import BatchList from "../../components/batches/BatchList";
import Loader from "../../components/Loader";

export default function ManageBatchesTabs() {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: batchesResponse, isLoading: batchesLoading } = useActiveBatches();
  const batches = batchesResponse?.data || [];

  const filteredBatches = batches.filter(b => 
    b.batch_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.course?.course_name && b.course.course_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (batchesLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#e8f0f2] p-2 md:p-4 lg:p-8 font-sans text-gray-800 flex justify-center">
      <div className="w-full max-w-[1400px] flex gap-4 lg:gap-6 ">
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-xl rounded-[1.25rem] md:rounded-[2.5rem] p-3 md:p-6 shadow-sm border border-white/60 overflow-hidden">
          
          <BatchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} authUser={authUser} />

          {/* Navigates to the ID route when clicked */}
          <BatchList 
            batches={filteredBatches} 
            authUser={authUser} 
            onSelectBatch={(batch) => navigate(`/admin/batches/${batch._id}`)} 
          />

        </div>
      </div>
    </div>
  );
}