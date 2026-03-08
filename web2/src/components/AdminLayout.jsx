import React, { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, Briefcase, GraduationCap,
  BookPlus, CalendarDays, PlusCircle, Layers, ShieldCheck,
  LogOut, Menu, X, UserCircle, Building2, MapPin,
  PackageSearch, BookOpen, Calendar1Icon, ClipboardCheck
} from "lucide-react";
import useAuth from "../store/useAuth";
import { PERMISSIONS } from "../config/permissionConfig";
import { useBranches } from "../hooks/useBranches";

const AdminLayout = () => {
  const location = useLocation();
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

  const navigationGroups = useMemo(() => [
    {
      label: null,
      items: [
        { name: isSuperAdmin ? "Global Dashboard" : "Branch Dashboard", href: "/admin", icon: LayoutDashboard, permission: PERMISSIONS.VIEW_DASHBOARD }
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
        { name: "Add Course", href: "/admin/add-course", icon: BookPlus, permission: PERMISSIONS.MANAGE_COURSES },
        { name: "Master Syllabus", href: "/admin/manage-syllabus", icon: BookOpen, permission: PERMISSIONS.VIEW_SYLLABUS }, 
      ],
    },
    {
      label: "Inventory",
      items: [
        { name: "Manage Inventory", href: "/admin/inventory", icon: PackageSearch, permission: PERMISSIONS.VIEW_INVENTORY },
        { name: "Log Purchase", href: "/admin/add-inventory", icon: PlusCircle, permission: PERMISSIONS.MANAGE_INVENTORY },
      ],
    },
    {
      label: "Branches",
      items: [
        { name: "All Branches", href: "/admin/branches", icon: MapPin, permission: PERMISSIONS.VIEW_BRANCHES },
        { name: "Manage Branches", href: "/admin/manage-branches", icon: Building2, permission: PERMISSIONS.MANAGE_BRANCHES },
      ],
    },
    {
      label: "Batches & Attendance",
      items: [
        { name: "All Batches", href: "/admin/all-batches", icon: Layers, permission: PERMISSIONS.VIEW_BATCHES },
        { name: "Manage Batches", href: "/admin/manage-batches", icon: CalendarDays, permission: PERMISSIONS.MANAGE_BATCHES },
        { name: "Attendance Book", href: "/admin/attendance-book", icon: ClipboardCheck, permission: PERMISSIONS.VIEW_CLASSES }, 
      ],
    },
    {
      label: "System",
      items: [
        { name: "Manage Roles", href: "/admin/manage-roles", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_ROLES },
        { name: "Manage Admins", href: "/admin/manage-admins", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_ROLES },
        { name: "Manage Holidays", href: "/admin/manage-holidays", icon: Calendar1Icon, permission: PERMISSIONS.MANAGE_ROLES },
      ],
    },
  ], [isSuperAdmin]);

  const filteredNavigation = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => hasPermission(item.permission)),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, hasPermission]);

  return (
    <div className="min-h-screen bg-[#e8f0f2] relative flex overflow-x-hidden">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e293b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <span className="text-white font-semibold text-sm truncate max-w-[150px]">
              {activeBranch?.branch_name || "Loading..."}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`fixed z-40 bg-[#1e293b] shadow-2xl flex flex-col transition-all duration-300 inset-y-0 left-0 lg:inset-y-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-32px)] ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
        
        <div onClick={() => setIsCollapsed(!isCollapsed)} className="p-6 border-b border-white/10 shrink-0 flex justify-center items-center mt-2 cursor-pointer">
          <div className={`bg-white rounded-2xl flex justify-center items-center transition-all ${isCollapsed ? "p-1.5" : "px-4 py-2"}`}>
            <img src="/logo.png" alt="Logo" style={{ width: isCollapsed ? "40px" : "90px" }} />
          </div>
        </div>

        <div className={`p-4 shrink-0 bg-white/5 mt-4 rounded-2xl mx-4 transition-all ${isCollapsed ? "px-2" : "px-4"}`}>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shrink-0">
              <UserCircle size={20} className="text-teal-400" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate capitalize">{authUser?.full_name || "User"}</p>
                
                <div className="mt-1 flex items-center gap-1.5">
                   <ShieldCheck size={10} className="text-indigo-400 shrink-0" />
                   <p className="text-[9px] font-black uppercase text-indigo-300 truncate tracking-widest">
                     {typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name || "Role"}
                   </p>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                   <MapPin size={10} className="text-teal-500 shrink-0" />
                   <p className="text-[9px] font-black uppercase text-teal-400 truncate tracking-widest">
                     {isSuperAdmin ? "Global Access" : activeBranch?.branch_name || "Locating..."}
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto mt-4 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? "px-2" : "px-4"}`}>
          {filteredNavigation.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && group.label && (
                <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 mt-4">{group.label}</h3>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center rounded-xl transition-all group ${isCollapsed ? "justify-center py-3" : "space-x-3 px-4 py-3"} ${location.pathname === item.href ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                >
                  <item.icon size={20} className={`${location.pathname === item.href ? "text-[#14b8a6]" : "text-slate-500 group-hover:text-slate-300"}`} />
                  {!isCollapsed && <span className={location.pathname === item.href ? "font-bold text-sm" : "text-sm"}>{item.name}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className={`shrink-0 mt-auto border-t border-white/5 p-4`}>
          <button onClick={logout} className={`flex items-center justify-center w-full rounded-xl text-slate-400 font-bold hover:bg-red-500/10 hover:text-red-400 transition-all ${isCollapsed ? "py-3" : "space-x-2 py-3"}`}>
            <LogOut size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`relative z-0 flex flex-col min-h-screen w-full transition-all duration-300 ${isCollapsed ? "lg:pl-[112px]" : "lg:pl-[288px]"}`}>
        <div className="pt-20 lg:pt-4 px-4 pb-4 lg:pr-6 lg:pb-6 flex-1">
          <Outlet context={{ branchId: activeBranch?._id, branchName: activeBranch?.branch_name }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;