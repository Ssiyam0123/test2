// ==========================================
// 1. THE FLAT DICTIONARY (SINGLE SOURCE OF TRUTH)
// ==========================================
export const PERMISSIONS = {
  // 📊 Dashboard Permissions
  VIEW_ADMIN_DASHBOARD: "view_admin_dashboard",   
  VIEW_BRANCH_DASHBOARD: "view_branch_dashboard", 

  // 🎓 Student Page Permissions
  VIEW_STUDENTS: "view_students",
  ADD_STUDENT: "add_student",               // 🆕 Added
  STUDENT_PAYMENTS: "student_payments",
  STUDENT_PROFILE: "student_profile",
  STUDENT_COMMENT: "student_comment",
  STUDENT_EDIT: "student_edit",
  STUDENT_ACTIVE_CONTROL: "student_active_control",
  STUDENT_QRCODE: "student_qrcode",
  STUDENT_CERTIFICATE: "student_certificate",
  STUDENT_DELETE: "student_delete",

  // 💼 Employee Page Permissions
  VIEW_EMPLOYEES: "view_employees",
  ADD_EMPLOYEE: "add_employee",             // 🆕 Added
  EMPLOYEE_ROLE_CONTROL: "employee_role_control",
  EMPLOYEE_IDCARD: "employee_idcard",
  EMPLOYEE_QRCODE: "employee_qrcode",
  EMPLOYEE_ACTIVE_STATUS: "employee_active_status",
  EMPLOYEE_EDIT: "employee_edit",
  EMPLOYEE_DELETE: "employee_delete",

  // 📚 Course Page Permissions
  VIEW_COURSES: "view_courses",
  COURSE_ACTIVE: "course_active",
  COURSE_EDIT: "course_edit",
  COURSE_DELETE: "course_delete",

  // 📜 Master Syllabus Permissions
  VIEW_SYLLABUS: "view_syllabus",
  SYLLABUS_EDIT: "syllabus_edit",
  SYLLABUS_DELETE: "syllabus_delete",

  // 📦 Inventory Permissions
  VIEW_INVENTORY: "view_inventory",
  INVENTORY_REQUISITION_ACTION: "inventory_requisition_action", 
  INVENTORY_ADD_STOCK: "inventory_add_stock",

  // 🏢 Branch Permissions
  VIEW_BRANCHES: "view_branches",
  BRANCH_ACTIVE_STATUS: "branch_active_status",
  BRANCH_EDIT: "branch_edit",
  BRANCH_DELETE: "branch_delete",

  // 📅 All Batch Page Permissions
  VIEW_ALL_BATCHES: "view_all_batches",
  ADD_BATCH: "add_batch",                   // 🆕 Added
  BATCH_EDIT: "batch_edit",
  BATCH_DELETE: "batch_delete",

  // 🛠️ Manage Batch (Workspace) Permissions
  VIEW_BATCH_WORKSPACE: "view_batch_workspace",
  VIEW_BATCH_CALENDAR: "view_batch_calendar",
  SEND_REQUISITION: "send_requisition",
  TAKE_ATTENDANCE: "take_attendance",
  CURRICULUM_MATRIX: "curriculum_matrix",

  // 📊 Attendance Book Permissions
  VIEW_ATTENDANCE_BOOK: "view_attendance_book",

    UPDATE_MY_PROFILE: "update_my_profile", // 🆕 প্রোফাইল এডিট পারমিশন

  
  // ⚙️ System Settings Permissions
  VIEW_SETTINGS: "view_settings",
  MANAGE_ROLES: "manage_roles",
  MANAGE_SETTINGS: "manage_settings"
};

Object.freeze(PERMISSIONS);