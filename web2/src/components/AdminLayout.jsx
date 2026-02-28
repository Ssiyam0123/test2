import React, { useState, useMemo, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserPlus, Briefcase, GraduationCap, 
  BookPlus, CalendarDays, PlusCircle, Layers, ShieldCheck,
  LogOut, Menu, X, UserCircle, Building2, MapPin, PackageSearch, ChevronDown
} from "lucide-react";
import useAuth from "../store/useAuth";
import { apiURL } from "../../Constant.js";
import { useBranches } from "../hooks/useBranches"; 

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, authUser } = useAuth();
  const isSuperAdmin = authUser?.role === "superadmin";

  const [activeBranch, setActiveBranch] = useState(null);
  const { data: branchRes, isLoading: branchesLoading } = useBranches();
  const branches = branchRes?.data || [];

  // ==========================================
  // WORKSPACE AUTO-ASSIGNMENT
  // ==========================================
  useEffect(() => {
    if (authUser && !activeBranch && branches.length > 0) {
      if (isSuperAdmin) {
        // Automatically default Superadmin to the first branch to avoid breaking forms
        setActiveBranch(branches[0]);
      } else {
        // Automatically lock standard admins to their assigned branch
        const userBranchId = typeof authUser.branch === 'object' ? authUser.branch._id : authUser.branch;
        setActiveBranch({ _id: userBranchId, branch_name: "My Campus" });
      }
    }
  }, [authUser, isSuperAdmin, activeBranch, branches]);

  const handleBranchChange = (e) => {
    const selectedId = e.target.value;
    const branch = branches.find(b => b._id === selectedId);
    if (branch) {
      setActiveBranch(branch);
      // Optional: uncomment below if you want them to be pushed to dashboard on switch
      // navigate("/admin"); 
    }
  };

  const navigationGroups = useMemo(() => [
    { label: null, items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["superadmin", "admin", "registrar"] }] },
    { label: "Students", items: [
      { name: "All Students", href: "/admin/all-students", icon: Users, roles: ["superadmin", "admin", "registrar", "instructor"] },
      { name: "Add Student", href: "/admin/add-student", icon: UserPlus, roles: ["superadmin", "admin", "registrar"] },
    ]},
    { label: "Staff & Faculty", items: [
      { name: "All Employees", href: "/admin/all-employees", icon: Briefcase, roles: ["superadmin", "admin", "registrar"] },
      { name: "Add Employee", href: "/admin/add-employee", icon: UserPlus, roles: ["superadmin", "admin"] },
    ]},
    { label: "Academics", items: [
      { name: "All Courses", href: "/admin/all-courses", icon: GraduationCap, roles: ["superadmin", "admin", "registrar", "instructor"] },
      { name: "Add Course", href: "/admin/add-course", icon: BookPlus, roles: ["superadmin"] },
    ]},
    { label: "Inventory", items: [
      { name: "Manage Inventory", href: "/admin/inventory", icon: PackageSearch, roles: ["superadmin", "admin", "registrar", "staff"] },
      { name: "Log Purchase", href: "/admin/add-inventory", icon: PlusCircle, roles: ["superadmin", "admin", "staff"] },
    ]},
    { label: "Branches & Locations", items: [
      { name: "All Branches", href: "/admin/branches", icon: MapPin, roles: ["superadmin", "admin", "registrar", "instructor"] },
      { name: "Manage Branches", href: "/admin/manage-branches", icon: Building2, roles: ["superadmin"] },
      { name: "Add Branch", href: "/admin/add-branch", icon: PlusCircle, roles: ["superadmin"] },
    ]},
    { label: "Batches", items: [
      { name: "All Batches", href: "/admin/all-batches", icon: Layers, roles: ["superadmin", "admin", "registrar", "instructor"] },
      { name: "Manage Batches", href: "/admin/manage-batches", icon: CalendarDays, roles: ["superadmin", "admin", "registrar"] },
      { name: "Add Batch", href: "/admin/add-batch", icon: PlusCircle, roles: ["superadmin", "admin", "registrar"] },
    ]},
    { label: "System", items: [
      { name: "Manage Admins", href: "/admin/manage-admins", icon: ShieldCheck, roles: ["superadmin"] },
    ]},
  ], []);

  const filteredNavigation = useMemo(() => {
    const userRole = authUser?.role || "user";
    return navigationGroups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(userRole)) }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, authUser]);

  return (
    <div className="min-h-screen bg-[#e8f0f2] relative flex overflow-x-hidden">
      
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1e293b] shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg"><img src="/logo.png" alt="CIB Logo" className="h-8 w-auto object-contain" /></div>
            {authUser && <span className="text-white font-semibold text-sm truncate max-w-[150px] capitalize">Hi, {authUser.full_name?.split(" ")[0] || authUser.username || "Admin"}</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className={`fixed z-40 bg-[#1e293b] shadow-2xl flex flex-col transition-all duration-300 ease-in-out inset-y-0 left-0 lg:inset-y-4 lg:left-4 lg:rounded-3xl lg:h-[calc(100vh-32px)] ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
        
        {/* LOGO */}
        <div onClick={() => setIsCollapsed(!isCollapsed)} className={`p-6 border-b border-white/10 shrink-0 flex justify-center items-center mt-2 cursor-pointer hover:bg-white/5 transition-colors ${isCollapsed ? "px-2" : ""}`}>
          <div className={`bg-white rounded-2xl shadow-inner flex justify-center items-center transition-all duration-300 ${isCollapsed ? "p-1.5" : "px-4 py-2"}`}>
            <img src="/logo.png" alt="CIB Logo" className="object-contain transition-all duration-300" style={{ width: isCollapsed ? "40px" : "90px" }} />
          </div>
        </div>

        {/* PROFILE */}
        <div className={`p-4 border-b border-white/5 shrink-0 bg-white/5 mt-4 rounded-2xl transition-all duration-300 ${isCollapsed ? "mx-2 flex justify-center" : "mx-4"}`}>
          {authUser && (
            <div className="flex items-center space-x-3">
              {authUser.photo_url ? (
                <img src={authUser.photo_url.startsWith("http") ? authUser.photo_url : `${apiURL.image_url}${authUser.photo_url}`} alt={authUser.username} className="h-10 w-10 rounded-xl object-cover border border-white/20 shadow-sm shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shrink-0"><UserCircle size={20} className="text-teal-400" /></div>
              )}
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate capitalize">{authUser.full_name || authUser.username || "Administrator"}</p>
                  <p className={`text-[11px] font-black tracking-widest uppercase truncate ${authUser.role === 'superadmin' ? 'text-amber-400' : 'text-teal-400'}`}>{authUser.role}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* WORKSPACE DROPDOWN (SUPERADMIN ONLY) */}
        {isSuperAdmin && !isCollapsed && (
          <div className="px-4 mt-4 relative group">
            <div className="flex flex-col text-left overflow-hidden bg-slate-800 p-3 rounded-xl border border-amber-500/20 relative">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Viewing Workspace</span>
              <div className="flex items-center justify-between">
                <select 
                  value={activeBranch?._id || ""} 
                  onChange={handleBranchChange}
                  className="w-full bg-transparent text-sm font-black text-amber-500 outline-none cursor-pointer appearance-none z-10"
                >
                  {branches.map(b => (
                    <option key={b._id} value={b._id} className="text-slate-800">
                      {b.branch_name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-amber-500 absolute right-3 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className={`flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-2 ${isCollapsed ? "p-2" : "p-4"}`}>
          {filteredNavigation.map((group, index) => (
            <div key={index} className="space-y-1.5">
              {!isCollapsed ? group.label && <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 mt-2">{group.label}</h3> : group.label && <div className="w-8 mx-auto h-px bg-white/10 my-3"></div>}
              {group.items.map((item) => (
                <Link key={item.name} to={item.href} title={isCollapsed ? item.name : ""} onClick={() => setSidebarOpen(false)} className={`flex items-center rounded-xl transition-all duration-200 group ${isCollapsed ? "justify-center py-3 px-0 mx-1" : "space-x-3 px-4 py-3"} ${location.pathname === item.href ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium"}`}>
                  <item.icon size={20} className={`${location.pathname === item.href ? "text-[#14b8a6]" : "text-slate-500 group-hover:text-slate-300"} transition-colors shrink-0`} />
                  {!isCollapsed && <span className={location.pathname === item.href ? "font-bold" : ""}>{item.name}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className={`shrink-0 mt-auto ${isCollapsed ? "p-2 mb-2" : "p-4"}`}>
          <button onClick={logout} title={isCollapsed ? "Logout" : ""} className={`flex items-center justify-center w-full rounded-xl text-slate-400 font-bold hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all group ${isCollapsed ? "space-x-0 px-0 py-3" : "space-x-2 px-4 py-3"}`}>
            <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN CONTENT AREA (Grid Removed, Renders Immediately) */}
      <div className={`relative z-0 flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-[112px]" : "lg:pl-[288px]"}`}>
        <div className="pt-20 lg:pt-4 px-4 pb-4 lg:pr-6 lg:pb-6 flex-1">
          <Outlet context={{ branchId: activeBranch?._id }} />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;