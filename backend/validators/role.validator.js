import Joi from "joi";

// Create Role Schema
export const createRoleSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.empty": "Role name is required"
  }),
  description: Joi.string().allow("").optional(),
  permissions: Joi.array().items(Joi.string()).optional() // 🚀 Array of strings support
});

// Update Role Schema
export const updateRoleSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().allow("").optional(),
  permissions: Joi.array().items(Joi.string()).optional() // 🚀 Array of strings support
}).min(1);