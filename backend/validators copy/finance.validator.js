import Joi from "joi";
import { objectId } from "./common.js";

// Validate a new incoming payment
export const paymentCreateSchema = Joi.object({
  fee_record: objectId.required(),
  amount: Joi.number().positive().required().messages({
    "number.positive": "Payment amount must be greater than zero.",
    "any.required": "Payment amount is required."
  }),
  payment_type: Joi.string()
    .valid("Admission Fee", "Installment", "Other")
    .required(),
  payment_method: Joi.string()
    .valid("Cash", "Mobile Banking", "Bank Transfer", "Card")
    .required(),
  transaction_id: Joi.string().allow("").optional(),
  remarks: Joi.string().max(200).allow("").optional()
}).unknown(false);

// Validate manual discount updates by an admin
export const feeUpdateSchema = Joi.object({
  discount: Joi.number().min(0).required().messages({
    "number.min": "Discount cannot be a negative value."
  })
}).unknown(false);