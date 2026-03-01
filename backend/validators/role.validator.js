import Joi from "joi";

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Role name is required.",
    "string.min": "Role name must be at least 2 characters long."
  }),
  description: Joi.string().max(255).allow("").optional(),
  permissions: Joi.array().items(Joi.string()).optional()
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).allow("").optional(),
  permissions: Joi.array().items(Joi.string()).optional()
});