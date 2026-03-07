import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(50),
  description: z.string().trim().max(255).optional().default(""),
  permissions: z.array(z.string().trim()).optional().default([])
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  description: z.string().trim().max(255).optional(),
  permissions: z.array(z.string().trim()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
});