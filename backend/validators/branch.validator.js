import Joi from "joi";

export const branchCreateSchema = Joi.object({
  branch_name: Joi.string().required().trim(),
  branch_code: Joi.string()
    .pattern(/^[A-Za-z0-9\-]{2,10}$/)
    .uppercase()
    .required()
    .trim()
    .messages({
      "string.pattern.base": "Branch code must be 2-10 alphanumeric characters (hyphens allowed)."
    }),
  address: Joi.string().required().trim(),
  contact_email: Joi.string().email().lowercase().allow("").optional(),
  contact_phone: Joi.string().allow("").optional(),
  is_active: Joi.boolean().default(true)
});

export const branchUpdateSchema = Joi.object({
  branch_name: Joi.string().trim(),
  branch_code: Joi.string()
    .pattern(/^[A-Za-z0-9\-]{2,10}$/)
    .uppercase()
    .trim()
    .messages({
      "string.pattern.base": "Branch code must be 2-10 alphanumeric characters (hyphens allowed)."
    }),
  address: Joi.string().trim(),
  contact_email: Joi.string().email().lowercase().allow(""),
  contact_phone: Joi.string().allow(""),
  is_active: Joi.boolean()
}).min(1); // Ensure at least one field is provided for an update