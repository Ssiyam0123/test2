import React, { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, Briefcase, GraduationCap,
  BookPlus, CalendarDays, PlusCircle, Layers, ShieldCheck,
  LogOut, Menu, X, UserCircle, Building2, MapPin,
  PackageSearch, BookOpen, Calendar1Icon, ClipboardCheck, Settings, UserPen
} from "lucide-react";
import useAuth from "../store/useAuth";
import { PERMISSIONS } from "../config/permissionConfig";
import { useBranches } from "../hooks/useBranches";
import Avatar from "./common/Avatar"; // 🚀 Import Avatar

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { logout, authUser, hasPermission, isMaster: checkIsMaster } = useAuth();
  const isSuperAdmin = checkIsMaster(); 

  const [activeBranch, setActiveBranch] = useState(null);

  const { data: branchRes } = useBranches(
    {},
    { enabled: !!isSuperAdmin } 
  );
  const branches = branchRes?.data || [];

  useEffect(() => {
    if (authUser && !activeBranch) {
      if (isSuperAdmin && branches.length > 0) {
        setActiveBranch(branches[0]);
      } else if (!isSuperAdmin) {
        const userBranch = authUser?.branch;
        if (userBranch && typeof userBranch === 'object') {
          setActiveBranch({ 
            _id: userBranch._id, 
            branch_name: userBranch.branch_name 
          });
        }
      }
    }
  }, [authUser, isSuperAdmin, branches, activeBranch]);

  // 🚀 ড্যাশবোর্ড এক্সেস চেক
  const hasDashboardAccess = useMemo(() => 
    hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD) || 
    hasPermission(PERMISSIONS.VIEW_BRANCH_DASHBOARD), 
  [hasPermission]);

  const navigationGroups = useMemo(() => [
    {
      label: null,
      items: [
        { 
          name: hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD) ? "Global Dashboard" : "Branch Dashboard", 
          href: "/admin", 
          icon: LayoutDashboard, 
          visible: hasDashboardAccess 
        }
      ],
    },
    {
      label: "Students",
      items: [
        { name: "All Students", href: "/admin/all-students", icon: Users, permission: PERMISSIONS.VIEW_STUDENTS },
        { name: "Add Student", href: "/admin/add-student", icon: UserPlus, permission: PERMISSIONS.ADD_STUDENT },
      ],
    },
    {
      label: "Staff & Faculty",
      items: [
        { name: "All Employees", href: "/admin/all-employees", icon: Briefcase, permission: PERMISSIONS.VIEW_EMPLOYEES },
        { name: "Add Employee", href: "/admin/add-employee", icon: UserPlus, permission: PERMISSIONS.ADD_EMPLOYEE }
      ],
    },
    {
      label: "Academics",
      items: [
        { name: "All Courses", href: "/admin/all-courses", icon: GraduationCap, permission: PERMISSIONS.VIEW_COURSES },
        { name: "Add Course", href: "/admin/add-course", icon: BookPlus, permission: PERMISSIONS.COURSE_EDIT }, 
        { name: "Master Syllabus", href: "/admin/manage-syllabus", icon: BookOpen, permission: PERMISSIONS.VIEW_SYLLABUS }, 
      ],
    },
    {
      label: "Inventory",
      items: [
        { name: "Manage Inventory", href: "/admin/inventory", icon: PackageSearch, permission: PERMISSIONS.VIEW_INVENTORY },
        { name: "Log Purchase", href: "/admin/add-inventory", icon: PlusCircle, permission: PERMISSIONS.INVENTORY_ADD_STOCK },
      ],
    },
    {
      label: "Branches",
      items: [
        { name: "All Branches", href: "/admin/branches", icon: MapPin, permission: PERMISSIONS.VIEW_BRANCHES },
        { name: "Manage Branches", href: "/admin/manage-branches", icon: Building2, permission: PERMISSIONS.BRANCH_EDIT },
      ],
    },
    {
      label: "Batches & Attendance",
      items: [
        { name: "All Batches", href: "/admin/all-batches", icon: Layers, permission: PERMISSIONS.VIEW_ALL_BATCHES },
        { name: "Create Batch", href: "/admin/add-batch", icon: PlusCircle, permission: PERMISSIONS.ADD_BATCH },
        { name: "Manage Batches", href: "/admin/manage-batches", icon: CalendarDays, permission: PERMISSIONS.VIEW_BATCH_WORKSPACE },
        { name: "Attendance Book", href: "/admin/attendance-book", icon: ClipboardCheck, permission: PERMISSIONS.VIEW_ATTENDANCE_BOOK }, 
      ],
    },
    {
      label: "Account",
      items: [
        { name: "My Profile", href: "/admin/profile", icon: UserPen, permission: PERMISSIONS.VIEW_MY_PROFILE }, 
      ],
    },
    {
      label: "System",
      items: [
        { name: "Manage Roles", href: "/admin/manage-roles", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_ROLES },
        { name: "Manage Holidays", href: "/admin/manage-holidays", icon: Calendar1Icon, permission: PERMISSIONS.VIEW_SETTINGS },
        { name: "System Settings", href: "/admin/settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
      ],
    },
  ], [hasDashboardAccess, hasPermission]);

  const filteredNavigation = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => 
          item.visible !== undefined ? item.visible : hasPermission(item.permission)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, hasPermission]);

  return (
    <div className="min-h-screen bg-[#e8f0f2] relative flex overflow-x-hidden">
      {/* 📱 MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e293b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar src={authUser?.photo_url} fallbackText={authUser?.full_name} sizeClass="h-9 w-9" />
            <span className="text-white font-semibold text-sm truncate max-w-[150px]">
              {activeBranch?.branch_name || "LMS Admin"}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 🖥️ SIDEBAR */}
      <div className={`fixed z-40 bg-[#1e293b] shadow-2xl flex flex-col transition-all duration-300 inset-y-0 left-0 lg:inset-y-4 lg:left-4 lg:rounded-[2rem] lg:h-[calc(100vh-32px)] ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-24" : "lg:w-72"}`}>
        
        {/* LOGO */}
        <div onClick={() => setIsCollapsed(!isCollapsed)} className="p-6 shrink-0 flex justify-center items-center cursor-pointer group">
          <div className={`bg-white rounded-2xl flex justify-center items-center transition-all ${isCollapsed ? "p-1.5" : "px-4 py-2"}`}>
            <img src="/logo.png" alt="Logo" style={{ width: isCollapsed ? "35px" : "85px" }} className="transition-transform group-hover:scale-110" />
          </div>
        </div>

        {/* 👤 USER PROFILE CARD (Clickable) */}
        <div 
          onClick={() => navigate("/admin/profile")}
          className={`p-4 shrink-0 bg-white/5 rounded-2xl mx-4 transition-all cursor-pointer hover:bg-white/10 group ${isCollapsed ? "px-2" : "px-4"}`}
        >
          <div className="flex items-center space-x-3">
            <Avatar 
              src={authUser?.photo_url} 
              fallbackText={authUser?.full_name} 
              sizeClass="h-10 w-10 shadow-lg" 
              className="border border-teal-500/30 group-hover:border-teal-400 transition-colors"
            />
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate capitalize tracking-tight">{authUser?.full_name || "User"}</p>
                <div className="mt-1 flex items-center gap-1.5">
                   <ShieldCheck size={10} className="text-indigo-400 shrink-0" />
                   <p className="text-[9px] font-black uppercase text-indigo-300 truncate tracking-widest leading-none">
                     {typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name || "Role"}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🧭 NAVIGATION - scrollbar সরানো হয়েছে */}
        <nav className={`flex-1 overflow-y-auto mt-4 px-3 space-y-1 scrollbar-hide ${isCollapsed ? "px-2" : "px-4"}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filteredNavigation.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && group.label && (
                <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 mt-4 opacity-50">{group.label}</h3>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center rounded-xl transition-all group ${isCollapsed ? "justify-center py-3" : "space-x-3 px-4 py-3"} ${isActive ? "bg-white/10 text-white shadow-sm ring-1 ring-white/5" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                  >
                    <item.icon size={20} className={`${isActive ? "text-[#14b8a6]" : "text-slate-500 group-hover:text-slate-300"}`} />
                    {!isCollapsed && <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* 🚪 LOGOUT */}
        <div className={`shrink-0 mt-auto p-4`}>
          <button onClick={logout} className={`flex items-center justify-center w-full rounded-xl text-slate-400 font-bold hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? "py-3" : "space-x-2 py-3"}`}>
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* 🖼️ MAIN CONTENT */}
      <div className={`relative z-0 flex flex-col min-h-screen w-full transition-all duration-300 ${isCollapsed ? "lg:pl-[112px]" : "lg:pl-[304px]"}`}>
        <div className="pt-20 lg:pt-4 px-4 pb-4 lg:pr-8 lg:pb-8 flex-1">
          <Outlet context={{ branchId: activeBranch?._id, branchName: activeBranch?.branch_name }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;