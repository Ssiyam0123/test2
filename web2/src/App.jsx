import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast from "react-hot-toast";

// STORE & LAYOUTS
import useAuth from "./store/useAuth";
import LogoLoader from "./components/LogoLoader.jsx";
import AdminLayout from "./components/AdminLayout";
import PublicLayout from "./components/PublicLayout";

// PUBLIC & AUTH PAGES
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import BranchDashboard from "./pages/BranchDashboard"; // 🚀 MUST IMPORT THIS
import SearchStudent from "./pages/student-public/SearchStudent.jsx";
import StudentDetails from "./pages/student-public/StudentDetails.jsx";
import EmployeeDetails from "./pages/employee-public/EmployeeDetails.jsx";

// FEATURE DOMAINS
import AllStudents from "./pages/students/AllStudents.jsx";
import AddStudent from "./pages/students/AddStudent.jsx";
import UpdateStudent from "./pages/students/UpdateStudent.jsx";
import AllCourses from "./pages/courses/AllCourses.jsx";
import AddCourse from "./pages/courses/AddCourse.jsx";
import AllEmployees from "./pages/employees/AllEmployees.jsx";
import AddEmployeeForm from "./pages/employees/AddEmployee.jsx";
import UpdateEmployee from "./pages/employees/UpdateEmployee.jsx";
import ManageAdmins from "./pages/ManageAdmins";
import ManageRoles from "./pages/system/ManageRoles";
import ManageBatchesTabs from "./pages/batches/ManageBatchesTabs.jsx";
import ManageBatches from "./pages/batches/ManageBatches.jsx";
import BatchListPage from "./pages/batches/BatchListPage.jsx";
import AddBatch from "./pages/batches/AddBatch.jsx";
import BatchFormContainer from "./components/batches/BatchFormContainer.jsx";
import ManageBranches from "./pages/branches/ManageBranches.jsx";
import BranchDetails from "./pages/branches/BranchDetails.jsx";
import AllBranches from "./pages/branches/AllBranches.jsx";
import ManageBranchForm from "./pages/branches/ManageBranchForm.jsx";
import ManageInventory from "./pages/inventory/ManageInventory.jsx";
import AddInventory from "./pages/inventory/AddInventory.jsx";

// SYLLABUS DOMAIN
import ManageMasterSyllabus from "./pages/master-syllabus/ManageMasterSyllabus.jsx";
import AddMasterSyllabus from "./pages/master-syllabus/AddMasterSyllabus.jsx";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, cacheTime: 10 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

// ==========================================
// PBAC ROUTE GUARDS
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  return authUser ? children : <Navigate to="/login" replace />;
};

const RoleGuard = ({ requiredPermission }) => {
  const { authUser } = useAuth(); 
  const context = useOutletContext(); 

  const hasPerm = () => {
    if (!authUser) return false;
    
    const roleName = typeof authUser.role === 'string' ? authUser.role : authUser.role?.name;
    if (roleName?.toLowerCase().replace(/\s/g, '') === "superadmin") return true;

    const userPermissions = authUser.role?.permissions || authUser.permissions || [];
    if (userPermissions.includes("all_access")) return true;
    
    return userPermissions.includes(requiredPermission);
  };

  if (!hasPerm()) {
    toast.error("You do not have permission to view this page.");
    return <Navigate to="/admin" replace />;
  }
  
  return <Outlet context={context} />;
};

// 🚀 TRAFFIC CONTROLLER FOR THE DASHBOARD
const AdminIndex = () => {
  const { authUser } = useAuth();
  
  const roleName = typeof authUser?.role === 'string' ? authUser.role : authUser?.role?.name;
  const userPermissions = authUser?.role?.permissions || authUser?.permissions || [];
  const safeRoleName = roleName?.toLowerCase().replace(/\s/g, '');
  
  const isSuperAdmin = userPermissions.includes("all_access") || safeRoleName === "superadmin";
  const isBranchAdmin = safeRoleName === "branchadmin" || safeRoleName === "admin";

  // 1. Superadmins get global
  if (isSuperAdmin) {
    return <Dashboard />;
  } 
  
  // 2. Branch Admins (or anyone with the specific permission) get branch dashboard
  if (isBranchAdmin || userPermissions.includes("view_dashboard")) {
    return <BranchDashboard />;
  }

  // 3. Fallback for staff/instructors
  if (userPermissions.includes("view_students")) {
    return <Navigate to="/admin/all-students" replace />;
  }
  
  return <div className="p-8 text-center font-bold text-slate-500 mt-20">Access Denied: Please contact System Administrator.</div>;
};

// ==========================================
// MAIN ROUTER
// ==========================================
function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LogoLoader />;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SearchStudent />} />
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </Route>

          <Route path="/login" element={authUser ? <Navigate to="/admin" replace /> : <LoginPage />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminIndex />} />

            <Route element={<RoleGuard requiredPermission="view_students" />}>
              <Route path="all-students" element={<AllStudents />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="add_student" />}>
              <Route path="add-student" element={<AddStudent />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="edit_student" />}>
              <Route path="update-student/:id" element={<UpdateStudent />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="view_employees" />}>
              <Route path="all-employees" element={<AllEmployees />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="add_employee" />}>
              <Route path="add-employee" element={<AddEmployeeForm mode="add" />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="edit_employee" />}>
              <Route path="update-employee/:id" element={<UpdateEmployee mode="edit" />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="view_courses" />}>
              <Route path="all-courses" element={<AllCourses />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="manage_courses" />}>
              <Route path="add-course" element={<AddCourse />} />
              <Route path="update-course/:id" element={<AddCourse mode="edit" />} />
              
              {/* 🚀 NEW SYLLABUS ROUTES */}
              <Route path="manage-syllabus" element={<ManageMasterSyllabus />} />
              <Route path="add-syllabus" element={<AddMasterSyllabus mode="add" />} />
              <Route path="update-syllabus/:id" element={<AddMasterSyllabus mode="edit" />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="view_classes" />}>
              <Route path="all-batches" element={<BatchListPage />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="manage_classes" />}>
              <Route path="manage-batches" element={<ManageBatchesTabs />} />
              <Route path="batches/:id" element={<ManageBatches />} />
              <Route path="add-batch" element={<AddBatch />} />
              <Route path="edit-batch/:id" element={<BatchFormContainer />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="view_branches" />}>
              <Route path="branches" element={<AllBranches />} />
              <Route path="branches/:id" element={<BranchDetails />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="manage_branches" />}>
              <Route path="manage-branches" element={<ManageBranches />} />
              <Route path="manage-branches/:id" element={<BranchDetails />} />
              <Route path="add-branch" element={<ManageBranchForm mode="add" />} />
              <Route path="update-branch/:id" element={<ManageBranchForm mode="edit" />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="view_inventory" />}>
              <Route path="inventory" element={<ManageInventory />} />
            </Route>
            <Route element={<RoleGuard requiredPermission="manage_inventory" />}>
              <Route path="add-inventory" element={<AddInventory />} />
            </Route>

            <Route element={<RoleGuard requiredPermission="manage_roles" />}>
              <Route path="manage-admins" element={<ManageAdmins />} />
              <Route path="manage-roles" element={<ManageRoles />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;