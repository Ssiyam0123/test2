import { z } from "zod";
import { objectIdSchema } from "./common.js";

const nameRegex = /^[a-zA-Z\s\-'.]+$/;

const stringBoolean = z.preprocess((val) => {
  if (typeof val === "string") return val === "true";
  return Boolean(val);
}, z.boolean());

export const studentCreateSchema = z.object({
  student_name: z.string().regex(nameRegex, "Invalid name format"),
  fathers_name: z.string().regex(nameRegex, "Invalid name format"),
  student_id: z.string().min(1),
  registration_number: z.string().optional().default(""),
  course: objectIdSchema,
  batch: objectIdSchema,
  branch: objectIdSchema,
  gender: z.enum(["male", "female"]),
  issue_date: z.string().datetime().or(z.string()),
  email: z.string().email().or(z.literal("")).optional(),
  contact_number: z.string().optional().default(""),
  address: z.string().optional().default(""),

  status: z
    .enum(["active", "inactive", "completed", "discontinued", "on_leave"])
    .default("active"),
  competency: z
    .enum(["competent", "incompetent", "not_assessed"])
    .default("not_assessed"),

  discount_amount: z.coerce.number().min(0).optional().default(0),

  completion_date: z.string().nullable().optional(),

  is_active: stringBoolean.optional().default(true),
  is_verified: stringBoolean.optional().default(false),

  photo: z.any().optional(),
});

export const studentUpdateSchema = studentCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
