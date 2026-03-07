import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const collectPaymentSchema = z.object({
  fee_record: objectIdSchema,
  amount: z.number().positive("Payment amount must be greater than zero."),
  payment_type: z.string().trim().min(1),
  payment_method: z.string().trim().min(1),
  transaction_id: z.string().trim().optional().default(""),
  remarks: z.string().trim().optional().default("")
});

export const updateDiscountSchema = z.object({
  discount: z.number().nonnegative("Discount cannot be negative.")
});