import React from "react";
import Loader from "../Loader.jsx";
import { FolderOpen } from "lucide-react";
import Pagination from "./Pagination.jsx";

const DataTable = ({
  columns,
  data,
  renderRow,
  isLoading,
  emptyStateIcon: EmptyIcon = FolderOpen,
  emptyStateTitle = "No records found",
  emptyStateSubtitle = "There are currently no records to display.",
  pagination,
  page,
  onPageChange,
  searchTerm
}) => {
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-96 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden p-2">
      {isLoading && data?.length > 0 && (
        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-sm rounded-3xl">
          <Loader />
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-6 py-5 text-[13px] font-medium text-slate-400 capitalize tracking-wide border-b border-slate-100/50
                    ${col.align === "right" ? "text-right" : ""} 
                    ${col.className || ""} 
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                      <EmptyIcon size={28} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">{emptyStateTitle}</h3>
                    <p className="text-slate-400 mt-1 max-w-sm mx-auto text-sm">{emptyStateSubtitle}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2">
        <Pagination
          currentLength={data?.length || 0}
          total={pagination?.total || 0}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={onPageChange}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

export default DataTable;