import { z } from "zod";
import { objectIdSchema } from "./common.js";

const classItemSchema = z.object({
  topic: z.string().trim().min(1),
  order_index: z.number().int().min(1).optional(),
  class_number: z.number().int().min(1).optional(), // 🚀 Added
  class_type: z.enum(["Lecture", "Lab", "Assessment", "Other"]).default("Lecture"),
  description: z.string().optional().default("")
});

export const addClassSchema = z.union([
  z.array(classItemSchema).min(1),
  classItemSchema
]);
export const updateClassContentSchema = z.object({
  topic: z.string().trim().optional(),
  class_type: z.enum(["Lecture", "Lab", "Assessment", "Other"]).optional(),
  content_details: z.union([z.string(), z.array(z.string())]).optional(),
  is_completed: z.boolean().optional()
});

export const scheduleClassSchema = z.object({
  date_scheduled: z.string().datetime() // Validates ISO date strings
});

export const updateAttendanceSchema = z.object({
  attendanceRecords: z.array(
    z.object({
      student: objectIdSchema,
      status: z.enum(["Present", "Absent", "Late", "Excused"]),
      remarks: z.string().optional().default("")
    })
  ),
  instructorId: objectIdSchema.optional(),
  is_completed: z.boolean().optional(),
  financials: z.object({
    actual_cost: z.number().nonnegative(),
    expense_notes: z.string().optional().default("")
  }).optional()
});