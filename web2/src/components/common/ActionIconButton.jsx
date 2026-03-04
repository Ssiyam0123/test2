import React from "react";
import { Loader2 } from "lucide-react";

const ActionIconButton = ({ 
  icon: Icon, 
  onClick, 
  title, 
  variant = "primary", 
  disabled = false, 
  loading = false,
  className = ""
}) => {
  const baseClasses = "p-2 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "hover:bg-blue-50 text-blue-600",
    success: "hover:bg-emerald-50 text-emerald-600",
    danger: "hover:bg-red-50 text-red-600",
    warning: "hover:bg-orange-50 text-amber-600",
    purple: "hover:bg-purple-50 text-purple-600",
    neutral: "hover:bg-gray-100 text-gray-600",
    activeToggle: "hover:bg-amber-50 text-green-600", 
    inactiveToggle: "bg-gray-100 text-gray-500 hover:bg-green-50"
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); 
        if (!disabled && !loading && onClick) onClick(e);
      }}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      title={title}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Icon size={20} />
      )}
    </button>
  );
};

export default ActionIconButton;