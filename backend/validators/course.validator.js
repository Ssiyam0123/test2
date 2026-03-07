import { z } from "zod";

// 🚀 Helper to safely parse additional_info which might come as a string or array
const stringArraySchema = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.trim() === "" ? [] : val.split(",").map(s => s.trim());
  }
  return [];
}, z.array(z.string()).optional().default([]));

export const courseCreateSchema = z.object({
  course_name: z.string().trim().min(1),
  course_code: z.string().trim().min(1),
  description: z.string().optional().default(""),
  duration_value: z.coerce.number().positive(), // 🚀 Coerce string to number safely
  duration_unit: z.enum(["days", "weeks", "months", "years"]), 
  base_fee: z.coerce.number().nonnegative(),    // 🚀 Coerce string to number safely
  is_active: z.coerce.boolean().default(true),  // 🚀 Convert "true"/"false" to real boolean
  additional_info: stringArraySchema            // 🚀 Handle array/string conversions safely
}).transform(data => ({
  course_name: data.course_name,
  course_code: data.course_code,
  description: data.description,
  duration: {
    value: data.duration_value,
    unit: data.duration_unit
  },
  base_fee: data.base_fee,
  is_active: data.is_active,
  additional_info: data.additional_info
}));

export const courseUpdateSchema = z.object({
  course_name: z.string().trim().optional(),
  course_code: z.string().trim().optional(),
  description: z.string().optional(),
  duration_value: z.coerce.number().positive().optional(),
  duration_unit: z.enum(["days", "weeks", "months", "years"]).optional(),
  base_fee: z.coerce.number().nonnegative().optional(),
  is_active: z.coerce.boolean().optional(),
  additional_info: stringArraySchema.optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field is required to update",
}).transform(data => {
  const result = { ...data };
  if (data.duration_value !== undefined || data.duration_unit !== undefined) {
    result.duration = {};
    if (data.duration_value !== undefined) result.duration.value = data.duration_value;
    if (data.duration_unit !== undefined) result.duration.unit = data.duration_unit;
    delete result.duration_value;
    delete result.duration_unit;
  }
  return result;
});