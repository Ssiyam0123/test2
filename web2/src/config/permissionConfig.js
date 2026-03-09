// ==========================================
// 1. The Flat Dictionary (SINGLE SOURCE OF TRUTH)
// ==========================================
export const PERMISSIONS = {
  // Dashboard & Reports
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_BRANCH_STATS: "view_branch_stats",
  VIEW_REPORTS: "view_reports",

  // Students
  VIEW_STUDENTS: "view_students",
  VIEW_STUDENT_DETAILS: "view_student_details",
  ADD_STUDENT: "add_student",
  EDIT_STUDENT: "edit_student",
  DELETE_STUDENT: "delete_student",
  ADD_STUDENT_COMMENT: "add_student_comment",

  // Employees
  VIEW_EMPLOYEES: "view_employees",
  ADD_EMPLOYEE: "add_employee",
  EDIT_EMPLOYEE: "edit_employee",
  DELETE_EMPLOYEE: "delete_employee",

  // Finance & Accounts
  VIEW_FINANCE: "view_finance",
  MANAGE_FINANCE: "manage_finance",
  COLLECT_FEES: "collect_fees",
  APPLY_DISCOUNT: "apply_discount",
  ADD_EXPENSE: "add_expense",
  VIEW_EXPENSES: "view_expenses",

  // Inventory & Requisitions
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_REQUISITIONS: "view_requisitions",
  MANAGE_REQUISITIONS: "manage_requisitions",

  // Academics (Courses & Syllabus)
  VIEW_COURSES: "view_courses",
  MANAGE_COURSES: "manage_courses",
  VIEW_SYLLABUS: "view_syllabus",
  MANAGE_SYLLABUS: "manage_syllabus",

  // Batches & Classes
  VIEW_BATCHES: "view_batches",
  MANAGE_BATCHES: "manage_batches",
  DELETE_BATCH: "delete_batch",
  VIEW_CLASSES: "view_classes",
  MANAGE_CLASSES: "manage_classes",
  MANAGE_CURRICULUM: "manage_curriculum",
  USE_AUTO_SCHEDULER: "use_auto_scheduler",
  VIEW_ATTENDANCE: "view_attendance",
  TAKE_ATTENDANCE: "take_attendance",
  MARK_CLASS_COMPLETE: "mark_class_complete",
  REQUEST_REQUISITION: "request_requisition",
  VIEW_HOLIDAYS: "view_holidays",

  // System Admin
  VIEW_BRANCHES: "view_branches",
  MANAGE_BRANCHES: "manage_branches",
  VIEW_ROLES: "view_roles",
  MANAGE_ROLES: "manage_roles",
  MANAGE_USERS: "manage_users",
  VIEW_SETTINGS: "view_settings",
  MANAGE_SETTINGS: "manage_settings"
};

// ==========================================
// 2. The Grouped Array (FOR UI RENDERING ONLY)
// ==========================================
export const PERMISSION_MATRIX = [
  {
    moduleName: "Dashboard & Reports",
    page: "Main Dashboard",
    features: [
      { label: "View Global Stats", value: PERMISSIONS.VIEW_DASHBOARD },
      { label: "View Branch Analytics", value: PERMISSIONS.VIEW_BRANCH_STATS },
      { label: "View System Reports", value: PERMISSIONS.VIEW_REPORTS },
    ],
  },
  {
    moduleName: "Student Management",
    page: "All Students",
    features: [
      { label: "View Students List", value: PERMISSIONS.VIEW_STUDENTS },
      { label: "View Student Details", value: PERMISSIONS.VIEW_STUDENT_DETAILS },
      { label: "Add New Student", value: PERMISSIONS.ADD_STUDENT },
      { label: "Edit Student Info", value: PERMISSIONS.EDIT_STUDENT },
      { label: "Delete Student", value: PERMISSIONS.DELETE_STUDENT },
      { label: "Add Comment/Feedback", value: PERMISSIONS.ADD_STUDENT_COMMENT },
    ],
  },
  {
    moduleName: "Finance & Accounts",
    page: "Fees & Payments",
    features: [
      { label: "View Finance & Balance", value: PERMISSIONS.VIEW_FINANCE },
      { label: "Manage Finance Records", value: PERMISSIONS.MANAGE_FINANCE },
      { label: "Collect Student Fees", value: PERMISSIONS.COLLECT_FEES },
      { label: "Apply Discounts", value: PERMISSIONS.APPLY_DISCOUNT },
      { label: "Add Daily Expense", value: PERMISSIONS.ADD_EXPENSE },
      { label: "View Expenses", value: PERMISSIONS.VIEW_EXPENSES },
    ],
  },
  {
    moduleName: "Batch & Classes",
    page: "Manage Batches",
    features: [
      { label: "View Batches List", value: PERMISSIONS.VIEW_BATCHES },
      { label: "Create/Edit Batch", value: PERMISSIONS.MANAGE_BATCHES },
      { label: "Delete Batch", value: PERMISSIONS.DELETE_BATCH },
      { label: "View Class Workspace", value: PERMISSIONS.VIEW_CLASSES },
      { label: "Schedule/Edit Classes", value: PERMISSIONS.MANAGE_CLASSES },
      { label: "Access Curriculum Builder", value: PERMISSIONS.MANAGE_CURRICULUM },
      { label: "Use Auto Scheduler", value: PERMISSIONS.USE_AUTO_SCHEDULER },
      { label: "View Attendance Book", value: PERMISSIONS.VIEW_ATTENDANCE },
      { label: "Take/Manage Attendance", value: PERMISSIONS.TAKE_ATTENDANCE },
      { label: "Mark Class Complete", value: PERMISSIONS.MARK_CLASS_COMPLETE },
      { label: "Request Requisition", value: PERMISSIONS.REQUEST_REQUISITION },
      { label: "View Holiday Calendar", value: PERMISSIONS.VIEW_HOLIDAYS },
    ],
  },
  {
    moduleName: "Courses & Syllabus",
    page: "Academic Library",
    features: [
      { label: "View Courses", value: PERMISSIONS.VIEW_COURSES },
      { label: "Manage Courses", value: PERMISSIONS.MANAGE_COURSES },
      { label: "View Syllabus", value: PERMISSIONS.VIEW_SYLLABUS },
      { label: "Manage Syllabus", value: PERMISSIONS.MANAGE_SYLLABUS },
    ],
  },
  {
    moduleName: "Inventory System",
    page: "Stock & Requisition",
    features: [
      { label: "View Inventory", value: PERMISSIONS.VIEW_INVENTORY },
      { label: "Manage Inventory", value: PERMISSIONS.MANAGE_INVENTORY },
      { label: "View Requisitions", value: PERMISSIONS.VIEW_REQUISITIONS },
      { label: "Manage/Approve Requisitions", value: PERMISSIONS.MANAGE_REQUISITIONS },
    ],
  },
  {
    moduleName: "Employee & HR",
    page: "Manage Staff",
    features: [
      { label: "View Employee List", value: PERMISSIONS.VIEW_EMPLOYEES },
      { label: "Add New Employee", value: PERMISSIONS.ADD_EMPLOYEE },
      { label: "Edit Employee Info", value: PERMISSIONS.EDIT_EMPLOYEE },
      { label: "Delete Employee", value: PERMISSIONS.DELETE_EMPLOYEE },
    ],
  },
  {
    moduleName: "System Admin",
    page: "Settings & Branches",
    features: [
      { label: "View Branches", value: PERMISSIONS.VIEW_BRANCHES },
      { label: "Manage Branches", value: PERMISSIONS.MANAGE_BRANCHES },
      { label: "View Roles", value: PERMISSIONS.VIEW_ROLES },
      { label: "Manage Roles & Access", value: PERMISSIONS.MANAGE_ROLES },
      { label: "Manage System Users", value: PERMISSIONS.MANAGE_USERS },
      { label: "View System Settings", value: PERMISSIONS.VIEW_SETTINGS },
      { label: "Manage System Settings", value: PERMISSIONS.MANAGE_SETTINGS },
    ],
  },
];