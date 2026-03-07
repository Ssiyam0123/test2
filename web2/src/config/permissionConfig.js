// src/config/permissionConfig.js

export const PERMISSION_MATRIX = [
  {
    moduleName: "Dashboard",
    page: "Main Dashboard",
    features: [
      { label: "View Global Stats", value: "view_dashboard" },
      { label: "View Branch Analytics", value: "view_branch_stats" },
    ],
  },
  {
    moduleName: "Student Management",
    page: "All Students",
    features: [
      { label: "View Students List", value: "view_students" },
      { label: "View Student Details", value: "view_student_details" },
      { label: "Add New Student", value: "add_student" },
      { label: "Edit Student Info", value: "edit_student" },
      { label: "Delete Student", value: "delete_student" },
      { label: "Add Comment/Feedback", value: "add_student_comment" },
    ],
  },
  {
    moduleName: "Finance & Accounts",
    page: "Fees & Payments",
    features: [
      { label: "View Finance & Balance", value: "view_finance" },
      { label: "Collect Student Fees", value: "collect_fees" }, // 🚀 Wallet Button
      { label: "Add Daily Expense", value: "add_expense" },
      { label: "View Expenses", value: "view_expenses" },
    ],
  },
  {
    moduleName: "Batch & Classes",
    page: "Manage Batches",
    features: [
      { label: "View Batches", value: "view_batches" },
      { label: "Create/Edit Batch", value: "manage_batches" },
      { label: "Delete Batch", value: "delete_batch" },
      { label: "View Class Workspace", value: "view_classes" },
      { label: "Access Curriculum Builder", value: "manage_curriculum" },
      { label: "Use Auto Scheduler", value: "use_auto_scheduler" },
      { label: "Schedule/Edit Classes", value: "manage_classes" },
      { label: "Take Attendance", value: "take_attendance" },
      { label: "Mark Class Complete", value: "mark_class_complete" },
      { label: "Request Requisition", value: "request_requisition" },
      { label: "View Holiday Calendar", value: "view_holidays" },
    ],
  },
  {
    moduleName: "Courses & Syllabus",
    page: "Academic Library",
    features: [
      { label: "View Courses", value: "view_courses" },
      { label: "Manage Courses", value: "manage_courses" },
      { label: "View Syllabus", value: "view_syllabus" },
      { label: "Manage Syllabus", value: "manage_syllabus" },
    ],
  },
  {
    moduleName: "Inventory System",
    page: "Stock & Requisition",
    features: [
      { label: "View Inventory", value: "view_inventory" },
      { label: "Manage Inventory", value: "manage_inventory" },
      { label: "View Requisitions", value: "view_requisitions" },
      { label: "Approve Requisitions", value: "approve_requisitions" },
    ],
  },
  {
    moduleName: "Employee & HR",
    page: "Manage Staff",
    features: [
      { label: "View Employee List", value: "view_employees" },
      { label: "Add/Edit Employee", value: "edit_employee" },
      { label: "Delete Employee", value: "delete_employee" },
    ],
  },
  {
    moduleName: "System Admin",
    page: "Settings & Branches",
    features: [
      { label: "View Branches", value: "view_branches" },
      { label: "Manage Branches", value: "manage_branches" },
      { label: "Manage Roles & Access", value: "manage_roles" },
    ],
  },
];
