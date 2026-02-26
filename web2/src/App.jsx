import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ==========================================
// STORE & LAYOUTS
// ==========================================
import useAuth from "./store/useAuth";
import LogoLoader from "./components/LogoLoader.jsx";
import AdminLayout from "./components/AdminLayout";
import PublicLayout from "./components/PublicLayout";

// ==========================================
// PUBLIC & AUTH PAGES
// ==========================================
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SearchStudent from "./pages/student-public/SearchStudent.jsx";
import StudentDetails from "./pages/student-public/StudentDetails.jsx";
import EmployeeDetails from "./pages/employee-public/EmployeeDetails.jsx";

// ==========================================
// FEATURE DOMAINS
// ==========================================

// Students
import AllStudents from "./pages/students/AllStudents.jsx";
import AddStudent from "./pages/students/AddStudent.jsx";
import UpdateStudent from "./pages/students/UpdateStudent.jsx";

// Courses
import AllCourses from "./pages/courses/AllCourses.jsx";
import AddCourse from "./pages/courses/AddCourse.jsx";

// Employees & Admins
import AllEmployees from "./pages/employees/AllEmployees.jsx";
import AddEmployeeForm from "./pages/employees/AddEmployee.jsx";
import UpdateEmployee from "./pages/employees/UpdateEmployee.jsx";
import ManageAdmins from "./pages/ManageAdmins";

// Batches
import ManageBatchesTabs from "./pages/batches/ManageBatchesTabs.jsx";
import ManageBatches from "./pages/batches/ManageBatches.jsx";
import BatchListPage from "./pages/batches/BatchListPage.jsx";
import AddBatch from "./pages/batches/AddBatch.jsx";
import BatchFormContainer from "./components/batches/BatchFormContainer.jsx";
import ManageBranches from "./pages/branches/ManageBranches.jsx";
import BranchDetails from "./pages/branches/BranchDetails.jsx";

// Branches (Newly Integrated)
import AllBranches from "./pages/branches/AllBranches.jsx"; // Assuming this table component is built
import ManageBranchForm from "./pages/branches/ManageBranchForm.jsx";

// ==========================================
// APP CONFIGURATION
// ==========================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ==========================================
// ROUTE GUARDS
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  return authUser ? children : <Navigate to="/login" replace />;
};

const RoleGuard = ({ allowedRoles }) => {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) {
    // Graceful fallback for lower-tier users trying to access high-tier routes
    const fallback = role === "instructor" ? "/admin/all-students" : "/admin";
    return <Navigate to={fallback} replace />;
  }
  return <Outlet />;
};

const AdminIndex = () => {
  const { role } = useAuth();
  if (role === "instructor") {
    return <Navigate to="/admin/all-students" replace />;
  }
  return <Dashboard />;
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
          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SearchStudent />} />
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </Route>

          <Route
            path="/login"
            element={
              authUser ? <Navigate to="/admin" replace /> : <LoginPage />
            }
          />

          {/* ---------------- ADMIN ROUTES ---------------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Default Dashboard Routing */}
            <Route index element={<AdminIndex />} />

            {/* TIER 1: Shared Access (Admin, Registrar, Instructor) */}
            <Route
              element={
                <RoleGuard
                  allowedRoles={["admin", "registrar", "instructor"]}
                />
              }
            >
              {/* Read-Only / Operational Views */}
              <Route path="all-students" element={<AllStudents />} />
              <Route path="all-courses" element={<AllCourses />} />
              <Route path="manage-batches" element={<ManageBatchesTabs />} />
              <Route path="batches/:id" element={<ManageBatches />} />
              <Route path="branches" element={<AllBranches />} />
              <Route
                path="update-branch/:id"
                element={<ManageBranchForm mode="edit" />}
              />
              <Route path="manage-branches" element={<ManageBranches />} />
              <Route path="manage-branches/:id" element={<BranchDetails />} />
              <Route path="branches/:id" element={<BranchDetails />} />
            </Route>

            {/* TIER 2: Management Access (Admin, Registrar) */}
            <Route
              element={<RoleGuard allowedRoles={["admin", "registrar"]} />}
            >
              {/* Creation & Update Views */}
              <Route path="add-student" element={<AddStudent />} />
              <Route path="update-student/:id" element={<UpdateStudent />} />
              <Route path="add-course" element={<AddCourse />} />
              <Route
                path="update-course/:id"
                element={<AddCourse mode="edit" />}
              />
              <Route path="add-batch" element={<AddBatch />} />
            </Route>

            {/* TIER 3: Super Admin Strictly (Admin Only) */}
            <Route element={<RoleGuard allowedRoles={["admin"]} />}>
              {/* Sensitive Data & Infrastructure Configuration */}
              <Route path="manage-admins" element={<ManageAdmins />} />

              {/* Employee Management */}
              <Route path="all-employees" element={<AllEmployees />} />
              <Route
                path="add-employee"
                element={<AddEmployeeForm mode="add" />}
              />
              <Route
                path="update-employee/:id"
                element={<UpdateEmployee mode="edit" />}
              />
              <Route path="employee/:id" element={<EmployeeDetails />} />

              {/* Core System Configuration */}
              <Route path="all-batches" element={<BatchListPage />} />
              <Route path="edit-batch/:id" element={<BatchFormContainer />} />
              <Route
                path="add-branch"
                element={<ManageBranchForm mode="add" />}
              />
              <Route
                path="update-branch/:id"
                element={<ManageBranchForm mode="edit" />}
              />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
