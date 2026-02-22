import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AdminLayout from "./components/AdminLayout";
import PublicLayout from "./components/PublicLayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import useAuth from "./store/useAuth";
import LogoLoader from "./components/LogoLoader.jsx";

// Student Pages
import AddStudent from "./pages/AddStudent";
import AllStudents from "./pages/AllStudents";
import StudentDetails from "./pages/StudentDetails";
import UpdateStudent from "./pages/UpdateStudent";
import SearchStudent from "./pages/SearchStudent.jsx";
import GenerateCertificate from "./pages/GenerateCertificate.jsx";

// Course Pages
import AddCourse from "./pages/AddCourse";
import AllCourses from "./pages/AllCourses";

// Employee Pages
import AddEmployeeForm from "./pages/AddEmployee.jsx";
import AllEmployees from "./pages/AllEmployees.jsx";
import UpdateEmployee from "./pages/UpdateEmployee.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";

// Admin Pages
import ManageAdmins from "./pages/ManageAdmins";

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

const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuth();
  return authUser ? children : <Navigate to="/login" replace />;
};

// FIX: Smart RoleGuard that knows where to bounce rejected users
const RoleGuard = ({ allowedRoles }) => {
  const { role } = useAuth();
  
  if (!allowedRoles.includes(role)) {
    // Instructors get bounced to the student list; others to the dashboard
    const fallback = role === "instructor" ? "/admin/all-students" : "/admin";
    return <Navigate to={fallback} replace />;
  }
  
  return <Outlet />;
};

// FIX: Smart Index Route to handle initial login redirects
const AdminIndex = () => {
  const { role } = useAuth();
  // Instructors skip the dashboard and go straight to the student list
  if (role === "instructor") {
    return <Navigate to="/admin/all-students" replace />;
  }
  return <Dashboard />;
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
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<SearchStudent />} />
            <Route path="/student/:id" element={<StudentDetails />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </Route>
          
          <Route 
            path="/login" 
            element={authUser ? <Navigate to="/admin" replace /> : <LoginPage />} 
          />

          {/* ADMIN PROTECTED ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Base Route uses the new AdminIndex component */}
            <Route index element={<AdminIndex />} />

            {/* SHARED ROUTES: Admin, Registrar, Instructor */}
            <Route element={<RoleGuard allowedRoles={["admin", "registrar", "instructor"]} />}>
              <Route path="all-students" element={<AllStudents />} />
              <Route path="all-courses" element={<AllCourses />} />
            </Route>

            {/* MID-TIER ROUTES: Admin, Registrar only */}
            <Route element={<RoleGuard allowedRoles={["admin", "registrar"]} />}>
              <Route path="add-student" element={<AddStudent />} />
              <Route path="update-student/:id" element={<UpdateStudent />} />
              <Route path="generate-certificate/:id" element={<GenerateCertificate />} />
              <Route path="add-course" element={<AddCourse />} />
              <Route path="update-course/:id" element={<AddCourse mode="edit" />} />
            </Route>

            {/* HIGH-TIER ROUTES: Admin strictly */}
            <Route element={<RoleGuard allowedRoles={["admin"]} />}>
              <Route path="all-employees" element={<AllEmployees />} />
              <Route path="add-employee" element={<AddEmployeeForm />} />
              <Route path="update-employee/:id" element={<UpdateEmployee mode="edit" />} />
              <Route path="employee/:id" element={<EmployeeDetails />} />
              <Route path="manage-admins" element={<ManageAdmins />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;