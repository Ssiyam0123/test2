import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(255).allow("").optional(),
  permissions: Joi.array().items(Joi.string().trim()).optional()
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  description: Joi.string().trim().max(255).allow("").optional(),
  permissions: Joi.array().items(Joi.string().trim()).optional()
}).min(1);