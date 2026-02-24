import React, { useState } from "react";
import { User } from "lucide-react";
import { apiURL } from "../../../Constant.js";

// Fallback to localhost if apiURL.image_url is undefined for any reason
const BASE_URL = apiURL.image_url || "http://localhost:3030";

const Avatar = ({
  src,
  alt = "Profile",
  fallbackText,
  sizeClass = "h-10 w-10",
  isInactive = false,
  className = ""
}) => {
  const [imgError, setImgError] = useState(false);

  // Safely format the URL whether it is absolute (http://...) or relative (/uploads/...)
  const getValidImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    
    // Prevent double slashes like "http://localhost:3030//uploads/..."
    const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    return `${cleanBase}${cleanPath}`;
  };

  const finalSrc = getValidImageUrl(src);

  return (
    <div
      className={`shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden ${sizeClass} ${
        isInactive ? "opacity-60 grayscale" : ""
      } ${className}`}
    >
      {/* 1. Try to show the image */}
      {finalSrc && !imgError ? (
        <img
          src={finalSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)} // If image is broken (404), trigger fallback
        />
      ) : fallbackText ? (
        /* 2. Fallback to first letter of their name (e.g., "J" for John) */
        <span className="text-blue-500 font-bold text-sm uppercase">
          {fallbackText.charAt(0)}
        </span>
      ) : (
        /* 3. Ultimate fallback: A generic user icon */
        <User size={18} className="text-blue-500" />
      )}
    </div>
  );
};

export default Avatar;