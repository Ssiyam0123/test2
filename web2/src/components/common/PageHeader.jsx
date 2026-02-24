import React from "react";
import { Plus, Download } from "lucide-react";

const PageHeader = ({ 
  title, 
  subtitle, 
  onAdd, 
  addText = "Add", 
  onExport, 
  disableExport = false, 
  showExport = false 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        {showExport && onExport && (
          <button
            onClick={onExport}
            disabled={disableExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <Download size={16} /> <span>Export CSV</span>
          </button>
        )}
        
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus size={16} /> <span>{addText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;