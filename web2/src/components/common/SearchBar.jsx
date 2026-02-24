// src/components/common/SearchBar.jsx
import React from 'react';
import { Search, Loader2 } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  isLoading = false,
  showButton = true,
  className = ""
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        size={20}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={isLoading}
        className={`w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          showButton ? 'pr-28' : 'pr-4'
        }`}
      />
      {showButton && (
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
        </button>
      )}
    </form>
  );
};

export default SearchBar;