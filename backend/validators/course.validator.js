import { z } from "zod";

// 🚀 Helper: Safely parse strings into booleans ("false" -> false)
const booleanSchema = z.preprocess((val) => {
  if (val === "false" || val === false || val === "0" || val === 0) return false;
  if (val === "true" || val === true || val === "1" || val === 1) return true;
  return Boolean(val);
}, z.boolean());

// 🚀 Helper: Handle empty strings for numbers without making them 0
const optionalPositiveNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  return Number(val);
}, z.number().positive("Value must be greater than 0").optional());

const optionalNonNegativeNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  return Number(val);
}, z.number().min(0, "Value cannot be negative").optional());

// 🚀 Helper: Safely parse additional_info arrays
const stringArraySchema = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.trim() === "" ? [] : val.split(",").map(s => s.trim());
  }
  return [];
}, z.array(z.string()).optional().default([]));

// 🚀 Helper: Schema for nested duration object
const durationSchema = z.object({
  value: optionalPositiveNumber,
  unit: z.enum(["days", "weeks", "months", "years"]).optional()
});

export const courseCreateSchema = z.object({
  course_name: z.string().trim().min(1, "Course name is required"),
  course_code: z.string().trim().min(1, "Course code is required"),
  description: z.string().optional().default(""),
  
  // Accept BOTH nested objects or flat keys to prevent mismatch
  duration: durationSchema.optional(),
  duration_value: optionalPositiveNumber,
  duration_unit: z.enum(["days", "weeks", "months", "years"]).optional(),
  
  base_fee: z.preprocess((val) => Number(val), z.number().min(0, "Fee cannot be negative")),
  is_active: booleanSchema.optional().default(true),
  additional_info: stringArraySchema
}).transform(data => ({
  course_name: data.course_name,
  course_code: data.course_code,
  description: data.description,
  // Smart merge: Prioritize nested object if exists, otherwise use flat keys
  duration: {
    value: data.duration?.value || data.duration_value,
    unit: data.duration?.unit || data.duration_unit || "months"
  },
  base_fee: data.base_fee,
  is_active: data.is_active,
  additional_info: data.additional_info
}));

export const courseUpdateSchema = z.object({
  course_name: z.string().trim().min(1, "Course name cannot be empty").optional(),
  course_code: z.string().trim().min(1, "Course code cannot be empty").optional(),
  description: z.string().optional(),
  
  duration: durationSchema.optional(),
  duration_value: optionalPositiveNumber,
  duration_unit: z.enum(["days", "weeks", "months", "years"]).optional(),
  
  base_fee: optionalNonNegativeNumber,
  is_active: booleanSchema.optional(),
  additional_info: stringArraySchema.optional()
})
.refine(data => Object.keys(data).length > 0, {
  message: "At least one field is required to update",
})
.transform(data => {
  const result = { ...data };
  
  // Merge duration fields properly before sending to Mongoose
  if (data.duration || data.duration_value !== undefined || data.duration_unit !== undefined) {
    result.duration = result.duration || {};
    if (data.duration_value !== undefined) result.duration.value = data.duration_value;
    if (data.duration_unit !== undefined) result.duration.unit = data.duration_unit;
    
    // Clean up flat keys so they don't mess up the DB
    delete result.duration_value;
    delete result.duration_unit;
  }
  
  return result;
});