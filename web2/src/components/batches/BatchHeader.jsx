import React from "react";
import { Search, ChevronDown } from "lucide-react";

export default function BatchHeader({ searchTerm, setSearchTerm, authUser }) {
  return (
    <header className="flex justify-between items-center mb-8 px-2">
      <div className="relative w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search batches..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white rounded-full text-sm outline-none border-none shadow-sm"
        />
      </div>

      <div className="flex items-center gap-2 bg-white pl-1 pr-3 py-1 rounded-full shadow-sm">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold uppercase">
            {authUser?.full_name?.charAt(0) || "A"}
          </div>
          <span className="text-sm font-bold text-gray-700 capitalize hidden sm:block">
            {authUser?.full_name?.split(" ")[0] || "Admin"}
          </span>
          <ChevronDown size={16} className="text-gray-400" />
      </div>
    </header>
  );
}