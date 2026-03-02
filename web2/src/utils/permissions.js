// 🚀 1. The Flat Dictionary (Used in code logic: CanAccess, if-statements, etc.)
export const PERMISSIONS = {
  // Students
  VIEW_STUDENTS: "view_students",
  ADD_STUDENT: "add_student",
  EDIT_STUDENT: "edit_student",
  DELETE_STUDENT: "delete_student",
  
  // Employees
  VIEW_EMPLOYEES: "view_employees",
  ADD_EMPLOYEE: "add_employee",
  EDIT_EMPLOYEE: "edit_employee",
  DELETE_EMPLOYEE: "delete_employee",
  
  // Finance
  VIEW_FINANCE: "view_finance",
  COLLECT_PAYMENT: "collect_payment",
  APPLY_DISCOUNT: "apply_discount",

  // Inventory
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",

  // Academics
  VIEW_COURSES: "view_courses",
  MANAGE_COURSES: "manage_courses",
  VIEW_CLASSES: "view_classes",
  MANAGE_CLASSES: "manage_classes",
  TAKE_ATTENDANCE: "take_attendance",

  // System
  VIEW_BRANCHES: "view_branches",
  MANAGE_BRANCHES: "manage_branches",
  MANAGE_ROLES: "manage_roles",
  VIEW_DASHBOARD: "view_dashboard"
};

// 🚀 2. The Grouped Array (Used EXCLUSIVELY for rendering UI checkboxes in the Role Modal)
export const PERMISSION_MODULES = [
  {
    module: "Student Management",
    permissions: [
      { id: PERMISSIONS.VIEW_STUDENTS, label: "View Students" },
      { id: PERMISSIONS.ADD_STUDENT, label: "Add Student" },
      { id: PERMISSIONS.EDIT_STUDENT, label: "Edit Student" },
      { id: PERMISSIONS.DELETE_STUDENT, label: "Delete Student" }
    ]
  },
  {
    module: "Employee & HR",
    permissions: [
      { id: PERMISSIONS.VIEW_EMPLOYEES, label: "View Employees" },
      { id: PERMISSIONS.ADD_EMPLOYEE, label: "Add Employee" },
      { id: PERMISSIONS.EDIT_EMPLOYEE, label: "Edit Employee" },
      { id: PERMISSIONS.DELETE_EMPLOYEE, label: "Delete Employee" }
    ]
  },
  {
    module: "Finance & Accounts",
    permissions: [
      { id: PERMISSIONS.VIEW_FINANCE, label: "View Financials" },
      { id: PERMISSIONS.COLLECT_PAYMENT, label: "Collect Payments" },
      { id: PERMISSIONS.APPLY_DISCOUNT, label: "Apply Discounts" }
    ]
  },
  {
    module: "Inventory & Assets",
    permissions: [
      { id: PERMISSIONS.VIEW_INVENTORY, label: "View Inventory" },
      { id: PERMISSIONS.MANAGE_INVENTORY, label: "Manage Inventory" }
    ]
  },
  {
    module: "Academics",
    permissions: [
      { id: PERMISSIONS.VIEW_COURSES, label: "View Courses" },
      { id: PERMISSIONS.MANAGE_COURSES, label: "Manage Courses" },
      { id: PERMISSIONS.VIEW_CLASSES, label: "View Classes" },
      { id: PERMISSIONS.MANAGE_CLASSES, label: "Manage Classes" },
      { id: PERMISSIONS.TAKE_ATTENDANCE, label: "Take Attendance" }
    ]
  },
  {
    module: "System & Admin",
    permissions: [
      { id: PERMISSIONS.VIEW_BRANCHES, label: "View Branches" },
      { id: PERMISSIONS.MANAGE_BRANCHES, label: "Manage Branches" },
      { id: PERMISSIONS.MANAGE_ROLES, label: "Manage Roles" },
      { id: PERMISSIONS.VIEW_DASHBOARD, label: "View Analytics Dashboard" }
    ]
  }
];