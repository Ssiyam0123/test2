import React, { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  GraduationCap, 
  BookPlus,      
  CalendarDays,  
  PlusCircle,    
  Layers,        
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCircle,
  Building2,
  MapPin // Added for Branch Table View
} from "lucide-react";
import useAuth from "../store/useAuth";
import { apiURL } from "../../Constant.js";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, authUser } = useAuth();

  // 1. Define roles for each navigation item
  const navigationGroups = useMemo(
    () => [
      {
        label: null,
        items: [
          {
            name: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            roles: ["admin", "registrar"],
          },
        ],
      },
      {
        label: "Students",
        items: [
          {
            name: "All Students",
            href: "/admin/all-students",
            icon: Users,
            roles: ["admin", "registrar", "instructor"],
          },
          {
            name: "Add Student",
            href: "/admin/add-student",
            icon: UserPlus,
            roles: ["admin", "registrar"],
          },
        ],
      },
      {
        label: "Staff & Faculty",
        items: [
          {
            name: "All Employees",
            href: "/admin/all-employees",
            icon: Briefcase,
            roles: ["admin"],
          },
          {
            name: "Add Employee",
            href: "/admin/add-employee",
            icon: UserPlus, 
            roles: ["admin"],
          },
        ],
      },
      {
        label: "Academics",
        items: [
          {
            name: "All Courses",
            href: "/admin/all-courses",
            icon: GraduationCap, 
            roles: ["admin", "registrar", "instructor"],
          },
          {
            name: "Add Course",
            href: "/admin/add-course",
            icon: BookPlus, 
            roles: ["admin", "registrar"],
          },
        ],
      },
      // ==========================================
      // UPDATED: Branches & Locations Module
      // ==========================================
      {
        label: "Branches & Locations",
        items: [
          {
            name: "Manage Branches", // The Card Grid View (Operations)
            href: "/admin/manage-branches", 
            icon: Building2, 
            roles: ["admin", "registrar", "instructor"], 
          },
          {
            name: "Add Branch", // Admin Only
            href: "/admin/add-branch",
            icon: PlusCircle, 
            roles: ["admin"], 
          },
          {
            name: "All Branches", // The Table View (Directory)
            href: "/admin/branches", 
            icon: MapPin, 
            roles: ["admin", "registrar", "instructor"], 
          },
        ],
      },
      {
        label: "Batches",
        items: [
          {
            name: "Manage Batches",
            href: "/admin/manage-batches",
            icon: CalendarDays, 
            roles: ["admin", "registrar", "instructor"],
          },
          {
            name: "Add Batch",
            href: "/admin/add-batch",
            icon: PlusCircle,
            roles: ["admin", "registrar"],
          },
          {
            name: "All Batches",
            href: "/admin/all-batches",
            icon: Layers, 
            roles: ["admin", "registrar", "instructor"],
          },
        ],
      },
      {
        label: "System",
        items: [
          {
            name: "Manage Admins",
            href: "/admin/manage-admins",
            icon: ShieldCheck,
            roles: ["admin"],
          },
        ],
      },
    ],
    [],
  );

  // 2. Filter the navigation based on the current user's role
  const filteredNavigation = useMemo(() => {
    const userRole = authUser?.role || "instructor";

    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.roles.includes(userRole)),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, authUser]);

  return (
    <div className="min-h-screen bg-[#e8f0f2] relative flex overflow-x-hidden">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e293b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
              <img
                src="/logo.png"
                alt="CIB Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            {/* Show User Name on Mobile Bar */}
            {authUser && (
              <span className="text-white font-semibold text-sm truncate max-w-[150px] capitalize">
                Hi,{" "}
                {authUser.full_name?.split(" ")[0] ||
                  authUser.username ||
                  "Admin"}
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Floating Modern Sidebar */}
      <div
        className={`
          fixed z-40 bg-[#1e293b] shadow-2xl flex flex-col transition-all duration-300 ease-in-out
          inset-y-0 left-0 lg:inset-y-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-32px)]
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64 w-64"} 
        `}
      >
        {/* Logo Area (Clickable to minimize/maximize) */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Toggle Sidebar"
          className={`p-6 border-b border-white/10 shrink-0 flex justify-center items-center mt-2 cursor-pointer hover:bg-white/5 transition-colors ${isCollapsed ? "px-2" : ""}`}
        >
          <div
            className={`bg-white rounded-2xl shadow-inner flex justify-center items-center transition-all duration-300 ${isCollapsed ? "p-1.5" : "px-4 py-2"}`}
          >
            <img
              src="/logo.png"
              alt="CIB Logo"
              className="object-contain transition-all duration-300"
              style={{ width: isCollapsed ? "40px" : "90px" }}
            />
          </div>
        </div>

        {/* User Profile Area */}
        <div
          className={`p-4 border-b border-white/5 shrink-0 bg-white/5 mt-4 rounded-2xl transition-all duration-300 ${isCollapsed ? "mx-2 flex justify-center" : "mx-4"}`}
        >
          {authUser && (
            <div className="flex items-center space-x-3">
              {authUser.photo_url ? (
                <img
                  src={
                    authUser.photo_url.startsWith("http")
                      ? authUser.photo_url
                      : `${apiURL.image_url}${authUser.photo_url}`
                  }
                  alt={authUser.full_name || authUser.username}
                  className="h-10 w-10 rounded-xl object-cover border border-white/20 shadow-sm shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shrink-0">
                  <UserCircle size={20} className="text-teal-400" />
                </div>
              )}

              {/* Hide text when collapsed */}
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate capitalize">
                    {authUser.full_name || authUser.username || "Administrator"}
                  </p>
                  <p className="text-[11px] font-semibold text-teal-400 tracking-wide uppercase truncate">
                    {authUser.role}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <nav
          className={`flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-2 ${isCollapsed ? "p-2" : "p-4"}`}
        >
          {filteredNavigation.map((group, index) => (
            <div key={index} className="space-y-1.5">
              {/* Hide group headers when collapsed, show a divider instead */}
              {!isCollapsed
                ? group.label && (
                    <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mt-2">
                      {group.label}
                    </h3>
                  )
                : group.label && (
                    <div className="w-8 mx-auto h-px bg-white/10 my-3"></div>
                  )}

              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={isCollapsed ? item.name : ""} 
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center rounded-xl transition-all duration-200 group
                      ${isCollapsed ? "justify-center py-3 px-0 mx-1" : "space-x-3 px-4 py-3"}
                      ${isActive ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium"}
                    `}
                  >
                    <item.icon
                      size={20}
                      className={`${isActive ? "text-[#14b8a6]" : "text-slate-500 group-hover:text-slate-300"} transition-colors shrink-0`}
                    />
                    {!isCollapsed && (
                      <span className={isActive ? "font-bold" : ""}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className={`shrink-0 mt-auto ${isCollapsed ? "p-2 mb-2" : "p-4"}`}>
          <button
            onClick={logout}
            title={isCollapsed ? "Logout" : ""}
            className={`
              flex items-center justify-center w-full rounded-xl text-slate-400 font-bold 
              hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all group
              ${isCollapsed ? "space-x-0 px-0 py-3" : "space-x-2 px-4 py-3"}
            `}
          >
            <LogOut
              size={18}
              className="text-slate-500 group-hover:text-red-400 transition-colors shrink-0"
            />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div
        className={`
          relative z-0 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:pl-[112px]" : "lg:pl-[288px]"}
        `}
      >
        <div className="pt-20 lg:pt-4 px-4 pb-4 lg:pr-6 lg:pb-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;