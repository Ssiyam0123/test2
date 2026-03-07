import Joi from "joi";
import { objectId } from "./common.js";

export const requisitionUpsertSchema = Joi.object({
  class_content: objectId.required(),
  branch: objectId.optional(),
  batch: objectId.required(),
  budget: Joi.number().min(0).optional().default(0),
  items: Joi.array().items(
    Joi.object({
      item_name: Joi.string().trim().required(),
      quantity: Joi.number().min(0.01).required(),
      unit: Joi.string().trim().required()
    })
  ).min(1).required()
});

export const requisitionFulfillSchema = Joi.object({
  actual_cost: Joi.number().min(0).required()
});