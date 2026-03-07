import { z } from "zod";

const inventoryItemSchema = z.object({
  item_name: z.string().trim().min(1),
  category: z.enum(["Meat", "Dairy", "Produce", "Dry Goods", "Equipment", "Packaging", "Other"]).default("Other"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.string().trim().min(1),
  total_price: z.number().nonnegative().optional()
});

export const addStockPurchaseSchema = z.object({
  items: z.array(inventoryItemSchema).min(1),
  total_cost: z.number().nonnegative(),
  supplier: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default("")
});

