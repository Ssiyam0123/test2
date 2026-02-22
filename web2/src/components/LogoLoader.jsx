// components/LogoLoader.jsx
import React, { useState, useEffect } from "react";

const LogoLoader = ({ isLoading = true }) => {
  const [imgError, setImgError] = useState(false);
  
  // Two-step state to handle the CSS fade-out transition before unmounting
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [isVisible, setIsVisible] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      // Ensure the DOM has painted before triggering the fade-in
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false); // Trigger fade-out
    }
  }, [isLoading]);

  const handleTransitionEnd = () => {
    if (!isLoading) setShouldRender(false); // Unmount after fade-out completes
  };

  if (!shouldRender) return null;

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#000c1d]/90 backdrop-blur-md transition-opacity duration-700 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative flex flex-col items-center animate-gentleFloat">
        
        {/* Soft, diffuse background glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#EC1B23]/10 to-blue-500/10 blur-[80px] scale-150 pointer-events-none"></div>

        {/* Logo Card */}
        <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-700">
          {!imgError ? (
            <img
              src="/logo.png"
              alt="CIB Logo"
              className="w-44 h-44 object-contain drop-shadow-2xl"
              onError={() => setImgError(true)}
            />
          ) : (
            // Fallback UI managed via state, not DOM injection
            <div className="w-44 h-44 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="text-5xl font-light tracking-wider bg-gradient-to-r from-[#EC1B23] to-red-400 bg-clip-text text-transparent">
                CIB
              </div>
              <div className="text-xs text-blue-200/70 mt-4 font-light tracking-widest uppercase">
                Culinary Institute
              </div>
            </div>
          )}
        </div>

        {/* Gentle pulsing dots */}
        <div className="flex justify-center space-x-3 mt-10">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] animate-gentlePulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Standard style tag ensures this component is fully portable 
        without needing to modify tailwind.config.js for custom keyframes 
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes gentlePulse {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-gentleFloat {
          animation: gentleFloat 4s ease-in-out infinite;
        }

        .animate-gentlePulse {
          animation: gentlePulse 1.5s ease-in-out infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default LogoLoader;