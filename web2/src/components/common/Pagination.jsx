import React from "react";

const Pagination = ({
  currentLength = 0,
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  searchTerm = "",
  itemName = "records"
}) => {
  // Hide pagination entirely if there is no data
  if (!total || total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl z-20 relative">
      
      {/* Left Side: Info & Search Context */}
      <div className="text-sm text-gray-600 mb-4 sm:mb-0 text-center sm:text-left">
        Showing <span className="font-medium text-gray-900">{currentLength}</span> of <span className="font-medium text-gray-900">{total}</span> {itemName}
        {searchTerm && (
          <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Search: "{searchTerm}"
          </span>
        )}
      </div>

      {/* Right Side: Page Controls */}
      <div className="flex items-center space-x-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Prev
        </button>
        
        <div className="flex items-center space-x-1">
          {Array.from(
            { length: Math.min(5, totalPages) },
            (_, i) => {
              // Smart numbering logic: Keeps the current page centered when possible
              let pageNum =
                page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                  ? totalPages - 4 + i
                  : page - 2 + i;
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`min-w-[32px] h-8 flex items-center justify-center text-sm font-medium rounded-md transition ${
                      page === pageNum
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            }
          )}
        </div>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;