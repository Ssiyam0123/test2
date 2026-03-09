import { z } from "zod";

// ==========================================
// 🎓 Student Form Schema
// ==========================================

export const getStudentFormSchema = (mode) => z.object({
  student_name: z.string().min(1, "Student Name is required"),
  fathers_name: z.string().min(1, "Father's Name is required"),
  student_id: z.string().min(1, "Student ID is required"),
  course: z.string().min(1, "Course selection is required"),
  batch: z.string().min(1, "Batch selection is required"),
  branch: z.string().min(1, "Campus selection is required"),
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "Gender is required" }) }),
  issue_date: z.string().min(1, "Issue Date is required"),
  email: z.string().email("Invalid email format").or(z.literal("")).optional(),
  contact_number: z.string().optional(),
    completion_date: z.string().optional().or(z.literal("")),
  competency: z.string().optional(),
  status: z.string().optional()
});

// ==========================================
// 💼 Employee Form Schema (Dynamic for Add/Edit)
// ==========================================
export const getEmployeeFormSchema = (mode) => z.object({
  full_name: z.string().min(1, "Full Name is required"),
  employee_id: z.string().min(1, "Employee ID is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  branch: z.string().min(1, "Campus selection is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.string().min(1, "Role selection is required"),
  password: mode === "add" 
    ? z.string().min(6, "Password must be at least 6 characters") 
    : z.string().optional().or(z.literal("")),
  facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  others: z.string().url("Invalid URL").optional().or(z.literal(""))
});



// ==========================================
// 📚 Course Form Schema
// ==========================================
export const courseFormSchema = z.object({
  course_name: z.string().min(1, "Course Name is required"),
  course_code: z.string().min(1, "Course Code is required"),
  duration_value: z.coerce.number().positive("Duration must be a positive number"),
  duration_unit: z.enum(["days", "weeks", "months", "years"], { errorMap: () => ({ message: "Select a valid duration unit" }) }),
  base_fee: z.coerce.number().nonnegative("Base fee cannot be negative"),
  description: z.string().optional().default(""),
  additional_info: z.any().optional(), 
  is_active: z.coerce.boolean().optional().default(true)
});

// ==========================================
// 📅 Batch Form Schema (Dynamic)
// ==========================================
export const getBatchFormSchema = (mode) => z.object({
  batch_name: z.string().min(1, "Batch Title is required"),
  course: z.string().min(1, "Associated Course is required"),
  branch: z.string().min(1, "Campus selection is required"),
  instructors: z.array(z.string()).min(1, "Assign at least one instructor").optional(),
  schedule_days: z.array(z.string()).min(1, "Select at least one class day"),
  start_time: z.string().min(1, "Class Start Time is required"),
  end_time: z.string().min(1, "Class End Time is required"),
  start_date: z.string().min(1, "Official Start Date is required").refine((date) => {
    if (mode === "add") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }
    return true;
  }, { message: "Start date cannot be in the past" }),
  status: z.string().default("Upcoming")
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"]
});