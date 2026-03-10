import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

// STORE, LAYOUTS & CONFIG
import useAuth from "./store/useAuth";
import { PERMISSIONS } from "./config/permissionConfig";
import LogoLoader from "./components/LogoLoader";
import AdminLayout from "./components/AdminLayout";
import PublicLayout from "./components/PublicLayout";

// PUBLIC & AUTH PAGES
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import BranchDashboard from "./pages/BranchDashboard";
import SearchStudent from "./pages/student-public/SearchStudent";
import StudentDetails from "./pages/student-public/StudentDetails";
import EmployeeDetails from "./pages/employee-public/EmployeeDetails";

// FEATURE DOMAINS
import AllStudents from "./pages/students/AllStudents";
import AddStudent from "./pages/students/AddStudent";
import UpdateStudent from "./pages/students/UpdateStudent";
import AllCourses from "./pages/courses/AllCourses";
import AddCourse from "./pages/courses/AddCourse";
import AllEmployees from "./pages/employees/AllEmployees";
import AddEmployeeForm from "./pages/employees/AddEmployee";
import UpdateEmployee from "./pages/employees/UpdateEmployee";
import ManageAdmins from "./pages/ManageAdmins";
import ManageRoles from "./pages/system/ManageRoles";
import ManageBatchesTabs from "./pages/batches/ManageBatchesTabs";
import ManageBatches from "./pages/batches/ManageBatches";
import BatchListPage from "./pages/batches/BatchListPage";
import AddBatch from "./pages/batches/AddBatch";
import ManageBranches from "./pages/branches/ManageBranches";
import BranchDetails from "./pages/branches/BranchDetails";
import AllBranches from "./pages/branches/AllBranches";
import ManageBranchForm from "./pages/branches/ManageBranchForm";
import ManageInventory from "./pages/inventory/ManageInventory";
import AddInventory from "./pages/inventory/AddInventory";
import ManageMasterSyllabus from "./pages/master-syllabus/ManageMasterSyllabus";
import AddMasterSyllabus from "./pages/master-syllabus/AddMasterSyllabus";
import StudentFinance from "./pages/finance/StudentFinance";
import ManageHolidays from "./pages/setting/ManageHolidays";
import AttendanceBookPage from "./pages/batches/AttendanceBookPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

// 🔐 পাসওয়ার্ড প্রটেক্টেড রাউট (লগইন চেক)
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  return authUser ? children : <Navigate to="/login" replace />;
};

// 🛡️ রোল বেজড এক্সেস গার্ড
const RoleGuard = ({ requiredPermission }) => {
  const { hasPermission } = useAuth();
  const context = useOutletContext();
  const hasAccess = hasPermission(requiredPermission);

  useEffect(() => {
    if (!hasAccess) {
      toast.error("Access Denied: You don't have the required permission.");
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet context={context} />;
};

/**
 * 🚀 Dashboard Dispatcher
 * ইউজারের রোল অনুযায়ী সঠিক ড্যাশবোর্ডে পাঠায়
 */
const AdminIndex = () => {
  const { hasPermission, isMaster: checkIsMaster } = useAuth();
  const isSuperAdmin = checkIsMaster();

  if (isSuperAdmin || hasPermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD)) {
    return <Dashboard />;
  }
  if (hasPermission(PERMISSIONS.VIEW_BRANCH_DASHBOARD)) {
    return <BranchDashboard />;
  }
  if (hasPermission(PERMISSIONS.VIEW_ALL_BATCHES)) {
    return <Navigate to="/admin/all-batches" replace />;
  }
  if (hasPermission(PERMISSIONS.VIEW_STUDENTS)) {
    return <Navigate to="/admin/all-students" replace />;
  }

  return (
    <div className="p-12 text-center mt-20 bg-white rounded-[2.5rem] shadow-sm max-w-2xl mx-auto border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Access Denied</h2>
      <p className="text-slate-500 font-bold mt-2">Please contact your Super Admin for module access.</p>
    </div>
  );
};

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LogoLoader />;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* 🌐 PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SearchStudent />} />
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </Route>

          {/* 🔑 AUTHENTICATION */}
          <Route
            path="/login"
            element={authUser ? <Navigate to="/admin" replace /> : <LoginPage />}
          />

          {/* 🛠️ ADMIN PANEL (All Nested Routes) */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            
            {/* 0. Dashboard Home */}
            <Route index element={<AdminIndex />} />

            {/* 1. Account Settings */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_MY_PROFILE} />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* 2. Student Management */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_STUDENTS} />}>
              <Route path="all-students" element={<AllStudents />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.ADD_STUDENT} />}>
              <Route path="add-student" element={<AddStudent />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.STUDENT_EDIT} />}>
              <Route path="update-student/:id" element={<UpdateStudent />} />
            </Route>

            {/* 3. Staff & HR */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_EMPLOYEES} />}>
              <Route path="all-employees" element={<AllEmployees />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.ADD_EMPLOYEE} />}>
              <Route path="add-employee" element={<AddEmployeeForm mode="add" />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.EMPLOYEE_EDIT} />}>
              <Route path="update-employee/:id" element={<UpdateEmployee mode="edit" />} />
            </Route>

            {/* 4. Academic Courses */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_COURSES} />}>
              <Route path="all-courses" element={<AllCourses />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.COURSE_EDIT} />}>
              <Route path="add-course" element={<AddCourse />} />
              <Route path="update-course/:id" element={<AddCourse mode="edit" />} />
            </Route>

            {/* 5. Master Syllabus */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_SYLLABUS} />}>
              <Route path="manage-syllabus" element={<ManageMasterSyllabus />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.SYLLABUS_EDIT} />}>
              <Route path="add-syllabus" element={<AddMasterSyllabus mode="add" />} />
              <Route path="update-syllabus/:id" element={<AddMasterSyllabus mode="edit" />} />
            </Route>

            {/* 6. Batch & Attendance */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_ALL_BATCHES} />}>
              <Route path="all-batches" element={<BatchListPage />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_BATCH_WORKSPACE} />}>
              <Route path="manage-batches" element={<ManageBatchesTabs />} />
              <Route path="batches/:id" element={<ManageBatches />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_ATTENDANCE_BOOK} />}>
              <Route path="attendance-book" element={<AttendanceBookPage />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.ADD_BATCH} />}>
              <Route path="add-batch" element={<AddBatch />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.BATCH_EDIT} />}>
              <Route path="edit-batch/:id" element={<AddBatch />} />
            </Route>

            {/* 7. Financial Records */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.STUDENT_PAYMENTS} />}>
              <Route path="student-finance/:id" element={<StudentFinance />} />
            </Route>

            {/* 8. Organization Branches */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_BRANCHES} />}>
              <Route path="branches" element={<AllBranches />} />
              <Route path="branches/:id" element={<BranchDetails />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.BRANCH_EDIT} />}>
              <Route path="manage-branches" element={<ManageBranches />} />
              <Route path="add-branch" element={<ManageBranchForm mode="add" />} />
              <Route path="update-branch/:id" element={<ManageBranchForm mode="edit" />} />
            </Route>

            {/* 9. Inventory Control */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_INVENTORY} />}>
              <Route path="inventory" element={<ManageInventory />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.INVENTORY_ADD_STOCK} />}>
              <Route path="add-inventory" element={<AddInventory />} />
            </Route>

            {/* 10. System Controls */}
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.MANAGE_ROLES} />}>
              <Route path="manage-admins" element={<ManageAdmins />} />
              <Route path="manage-roles" element={<ManageRoles />} />
            </Route>
            <Route element={<RoleGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS} />}>
               <Route path="manage-holidays" element={<ManageHolidays />} />
            </Route>

          </Route>

          {/* 🛑 404 & FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;