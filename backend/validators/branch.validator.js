import { z } from "zod";

export const branchCreateSchema = z.object({
  branch_name: z.string().trim().min(1),
  branch_code: z.string().trim().min(1),
  address: z.string().trim().optional().default(""),
  contact_number: z.string().trim().optional().default(""),
  is_active: z.boolean().default(true)
});

export const branchUpdateSchema = z.object({
  branch_name: z.string().trim().optional(),
  branch_code: z.string().trim().optional(),
  address: z.string().trim().optional(),
  contact_number: z.string().trim().optional(),
  is_active: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field is required to update",
});