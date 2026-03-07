import { z } from "zod";

export const holidayCreateSchema = z.object({
  title: z.string().min(1, "Holiday title is required"),
  // Date must be "MM-dd" (e.g., 03-26) or "yyyy-MM-dd" (e.g., 2026-06-05)
  date_string: z.string().regex(/^(?:\d{4}-)?(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Invalid date format. Use MM-dd or yyyy-MM-dd"),
  is_active: z.boolean().optional().default(true)
});