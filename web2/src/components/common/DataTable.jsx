import React from "react";
import Loader from "../Loader.jsx";
import { User } from "lucide-react";
import Pagination from "./Pagination.jsx";

const DataTable = ({
  columns,
  data,
  renderRow,
  isLoading,
  emptyStateIcon: EmptyIcon = User,
  emptyStateTitle = "No records found",
  emptyStateSubtitle = "There are currently no records to display.",
  pagination,
  page,
  onPageChange,
  searchTerm
}) => {
  if (isLoading && (!data || data.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative">
      {isLoading && data?.length > 0 && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <Loader />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider 
                    ${col.align === "right" ? "text-right" : ""} 
                    ${col.className || ""} 
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.length > 0 ? (
              data.map((item, index) => renderRow(item, index))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <EmptyIcon size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{emptyStateTitle}</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">{emptyStateSubtitle}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentLength={data?.length || 0}
        total={pagination?.total || 0}
        page={page}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default DataTable;