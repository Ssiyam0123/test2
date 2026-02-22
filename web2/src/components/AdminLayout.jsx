import React, { useState, useMemo } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  UserCog,
  BookOpen,
  Library,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import useAuth from "../store/useAuth";
import { apiURL } from "../../Constant.js";

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, authUser } = useAuth();

  // 1. Define roles for each navigation item
  const navigationGroups = useMemo(() => [
    {
      label: null,
      items: [
        // FIX: Removed "instructor" so they don't see the Dashboard link
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["admin", "registrar"] },
      ],
    },
    {
      label: "Students",
      items: [
        { name: "All Students", href: "/admin/all-students", icon: Users, roles: ["admin", "registrar", "instructor"] },
        // Instructors cannot add students
        { name: "Add Student", href: "/admin/add-student", icon: UserPlus, roles: ["admin", "registrar"] },
      ],
    },
    {
      label: "Staff & Faculty",
      items: [
        // Only Admins can manage employees
        { name: "All Employees", href: "/admin/all-employees", icon: Briefcase, roles: ["admin"] },
        { name: "Add Employee", href: "/admin/add-employee", icon: UserCog, roles: ["admin"] },
      ],
    },
    {
      label: "Academics",
      items: [
        { name: "All Courses", href: "/admin/all-courses", icon: Library, roles: ["admin", "registrar", "instructor"] },
        // Only Admins (and maybe Registrars) can create new courses
        { name: "Add Course", href: "/admin/add-course", icon: BookOpen, roles: ["admin", "registrar"] },
      ],
    },
    {
      label: "System",
      items: [
        // Strictly Admins
        { name: "Manage Admins", href: "/admin/manage-admins", icon: ShieldCheck, roles: ["admin"] },
      ],
    },
  ], []);

  // 2. Filter the navigation based on the current user's role
  const filteredNavigation = useMemo(() => {
    const userRole = authUser?.role || "instructor"; // Fallback role for safety
    
    return navigationGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => item.roles.includes(userRole))
      }))
      // Remove groups that have no items left after filtering
      .filter(group => group.items.length > 0);
  }, [navigationGroups, authUser]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800"></h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
          transform transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-200 shrink-0 flex justify-center items-center">
          <img
            src="/logo.png"
            alt="CIB Logo"
            className="logo-image object-contain"
            width="80"
            height="80"
          />
        </div>

        {/* User Profile Area */}
        <div className="p-4 border-b border-gray-100 shrink-0 bg-gray-50/50">
          {authUser && (
            <div className="flex items-center space-x-3">
              {/* Profile Image Logic */}
              {authUser.photo_url ? (
                <img
                  src={authUser.photo_url.startsWith("http") ? authUser.photo_url : `${apiURL.image_url}${authUser.photo_url}`}
                  alt={authUser.full_name || authUser.username}
                  className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
                  <UserCircle size={20} className="text-blue-700" />
                </div>
              )}
              
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate capitalize">
                  {authUser.full_name || authUser.username || "Administrator"}
                </p>
                <p className="text-xs font-medium text-gray-500 truncate capitalize">
                  {authUser.role}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {filteredNavigation.map((group, index) => (
            <div key={index} className="space-y-1">
              {group.label && (
                <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                      }
                    `}
                  >
                    <item.icon
                      size={20}
                      className={`${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200 shrink-0 bg-gray-50/50">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg text-gray-600 font-medium hover:bg-red-50 hover:text-red-700 transition-colors group"
          >
            <LogOut
              size={20}
              className="text-gray-400 group-hover:text-red-600 transition-colors"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="lg:ml-64 relative z-0 flex flex-col min-h-screen">
        <div className="pt-16 lg:pt-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;