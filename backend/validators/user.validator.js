import { z } from "zod";
import { objectIdSchema } from "./common.js";

const nameRegex = /^[a-zA-Z\s\-'.]+$/;

const usernameRegex = /^[a-zA-Z0-9_.]+$/;

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(usernameRegex, "Only alphanumeric characters, underscores, and dots allowed"),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
  full_name: z.string().regex(nameRegex, "Invalid name format."),
  employee_id: z.string().min(1),
  joining_date: z.string().optional(),
  phone: z.string().min(1),
  designation: z.string().optional().default(""),
  department: z.string().optional().default(""),
  branch: objectIdSchema,
  role: objectIdSchema,
  status: z
    .enum(["Active", "On Leave", "Resigned"])
    .optional()
    .default("Active"),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  others: z.string().optional(),
  photo: z.any().optional(),
});

export const updateUserSchema = z
  .object({
    full_name: z.string().regex(nameRegex, "Invalid name format.").optional(),
    email: z.string().email().toLowerCase().optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(usernameRegex, "Only alphanumeric characters, underscores, and dots allowed")
      .optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    status: z.enum(["Active", "On Leave", "Resigned"]).optional(),
    branch: objectIdSchema.optional(),
    role: objectIdSchema.optional(),
    employee_id: z.string().optional(),
    joining_date: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    others: z.string().optional(),
    photo: z.any().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const roleUpdateSchema = z.object({
  role: objectIdSchema,
});

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    username: z.string().optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.username, {
    message: "Either email or username must be provided",
    path: ["email", "username"],
  });