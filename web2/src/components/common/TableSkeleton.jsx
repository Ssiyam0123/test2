import React from "react";

const TableSkeleton = ({ rows = 6 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="bg-gray-50 h-14 w-full border-b border-gray-200 flex items-center px-6">
      <div className="h-3 bg-gray-200 rounded w-32 mr-auto" />
      <div className="h-3 bg-gray-200 rounded w-24 mx-auto hidden md:block" />
      <div className="h-3 bg-gray-200 rounded w-28 ml-auto" />
    </div>

    {/* Rows */}
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center space-x-6 p-5 border-b border-gray-100">
        <div className="flex items-center space-x-4 flex-1">
          <div className="rounded-full bg-gray-200 h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="hidden lg:flex flex-col space-y-2 flex-1">
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="hidden md:block flex-shrink-0">
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
        <div className="flex space-x-2 shrink-0">
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
          <div className="h-8 w-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
    
    {/* Footer */}
    <div className="bg-gray-50 h-16 w-full flex items-center justify-between px-6">
      <div className="h-4 bg-gray-200 rounded w-40" />
      <div className="h-8 w-32 bg-gray-200 rounded" />
    </div>
  </div>
);

export default TableSkeleton;