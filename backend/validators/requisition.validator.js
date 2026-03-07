import { z } from "zod";
import { objectIdSchema } from "./common.js";

const reqItemSchema = z.object({
  item_name: z.string().trim().min(1),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.string().trim().min(1),
  inventory_item: objectIdSchema.optional(), // 👈 এটা যোগ করে দিস
  is_custom: z.boolean().optional()         // 👈 এটাও যোগ করে দিস
});

export const requisitionUpsertSchema = z.object({
  class_content: objectIdSchema,
  branch: objectIdSchema.optional(),
  batch: objectIdSchema,
  budget: z.number().nonnegative().optional().default(0),
  items: z.array(reqItemSchema).min(1, "At least one item is required")
});

export const requisitionFulfillSchema = z.object({
  actual_cost: z.number().nonnegative("Cost cannot be negative")
});