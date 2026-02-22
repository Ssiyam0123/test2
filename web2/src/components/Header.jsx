import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Info,
  BookOpen,
  UserPlus,
  Phone,
  UserCircle,
  LogIn,
} from "lucide-react";
import { apiURL } from "../../Constant.js";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Base URL for static links
  const baseUrl = apiURL.main_url;

  // Simplified Menu Items without Submenus
  const menuItems = [
    {
      name: "HOME",
      path: `${baseUrl}/`,
      icon: <Home className="w-4 h-4" />,
    },
    {
      name: "ABOUT",
      path: `${baseUrl}/about`,
      icon: <Info className="w-4 h-4" />,
    },
    {
      name: "COURSES",
      path: `${baseUrl}/courses`,
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      name: "ADMISSION",
      path: `${baseUrl}/admission`,
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      name: "CONTACT US",
      path: `${baseUrl}/contact`,
      icon: <Phone className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#000c1d] to-[#00112c] border-b border-white/10 backdrop-blur-lg supports-[backdrop-filter]:bg-[#000c1d]/95">
      {/* Top Bar */}
      <div className="hidden lg:block bg-gradient-to-r from-[#EC1B23]/10 to-[#FF3D3D]/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <a
                href="tel:+8801338958997"
                className="flex items-center space-x-2 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>01338-958997 (WhatsApp)</span>
              </a>
              <div className="h-4 w-px bg-white/20"></div>
              <a
                href="mailto:cib.dhk@gmail.com"
                className="flex items-center space-x-2 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <LogIn className="w-3 h-3 rotate-180" />
                <span>cib.dhk@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`${baseUrl}/verification`}
                className="flex items-center space-x-2 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <UserCircle className="w-3 h-3" />
                <span>Certificate Verification</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href={`${baseUrl}/`}
              className="flex items-center space-x-3 group hover:opacity-90 transition-opacity duration-200"
              aria-label="CIB - Go to homepage"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="CIB Logo"
                  className="logo-image object-contain"
                  width="40"
                  height="40"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                  CIB
                  <span className="block text-xs font-normal text-blue-200 tracking-wider">
                    The Culinary Institute of Bangladesh
                  </span>
                </h1>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}

            {/* CTA Button */}
            <a
              href={`https://docs.google.com/forms/d/e/1FAIpQLSc3k3JJAK9hyftMv3aJTILi33vHnNgpDa8lXsRQwMnQ1BkxVg/viewform`}
              className="ml-4 px-6 py-2.5 bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] text-white rounded-xl hover:from-[#FF3D3D] hover:to-[#EC1B23] transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:shadow-[#EC1B23]/30 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply Now</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 rounded-lg bg-white/5 hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-[#00112c] border border-white/10 rounded-2xl mt-2 mb-4 overflow-hidden animate-in slide-in-from-top-5 duration-300 shadow-2xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium text-blue-200 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}

              {/* Mobile CTA Buttons */}
              <div className="pt-4 space-y-3 border-t border-white/10 p-2">
                <a
                  href={`${baseUrl}/admission/apply`}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#EC1B23] to-[#FF3D3D] text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2 shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Apply Now</span>
                </a>

                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 border border-white/20 text-blue-200 rounded-lg hover:bg-white/5 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Student Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;