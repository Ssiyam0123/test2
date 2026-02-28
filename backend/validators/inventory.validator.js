// backend/validators/inventory.validator.js
import Joi from "joi";
import { objectId } from "./common.js";

const categories = ["Meat", "Dairy", "Produce", "Dry Goods", "Equipment", "Packaging", "Other"];

export const stockPurchaseSchema = Joi.object({
  branch: objectId.required(),
  items: Joi.array().items(
    Joi.object({
      item_name: Joi.string().required().trim(),
      category: Joi.string().valid(...categories).required(), // STRICTLY REQUIRED
      quantity: Joi.number().positive().required(),
      unit: Joi.string().required(),
      total_price: Joi.number().min(0).optional()
    })
  ).min(1).required(),
  total_cost: Joi.number().min(0).required(),
  supplier: Joi.string().allow("").optional(), // SUPPLIER OPTIONAL
  notes: Joi.string().allow("").optional()
});

// ... keep your other schemas here

export const requisitionDeductionSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().lowercase(),
      qty: Joi.number().positive().required(),
      unit: Joi.string().valid("kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen").required()
    })
  ).min(1).required()
});