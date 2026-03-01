export const PERMISSION_MODULES = [
  {
    module: "Student Management",
    permissions: [
      { id: "view_students", label: "View Directory" },
      { id: "add_student", label: "Add Students" },
      { id: "edit_student", label: "Edit Students" },
      { id: "delete_student", label: "Delete Students" },
    ]
  },
  {
    module: "Staff & Faculty",
    permissions: [
      { id: "view_employees", label: "View Directory" },
      { id: "add_employee", label: "Add Employees" },
      { id: "edit_employee", label: "Edit Employees" },
      { id: "delete_employee", label: "Delete Employees" },
    ]
  },
  {
    module: "Financial Operations",
    permissions: [
      { id: "view_finance", label: "View Ledgers & Fees" },
      { id: "collect_payment", label: "Collect Payments" },
      { id: "apply_discount", label: "Apply Discounts/Scholarships" },
    ]
  },
  {
    module: "Inventory & Assets",
    permissions: [
      { id: "view_inventory", label: "View Pantry & Assets" },
      { id: "manage_inventory", label: "Add/Deduct Stock" },
    ]
  },
  {
    module: "Academics & Classes",
    permissions: [
      { id: "view_classes", label: "View Schedule" },
      { id: "manage_classes", label: "Create & Edit Classes" },
      { id: "take_attendance", label: "Take Attendance" },
      { id: "request_bazar", label: "Request Bazar/Requisitions" },
    ]
  },
  {
    module: "System Admin",
    permissions: [
      { id: "all_access", label: "Full System Access (Master Key)" },
      { id: "manage_roles", label: "Manage Roles & Permissions" },
    ]
  }
];