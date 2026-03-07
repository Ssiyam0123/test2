import Joi from "joi";
import { objectId } from "./common.js";

const nameRegex = /^[a-zA-Z\s\-'.]+$/;

export const userCreateSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().pattern(nameRegex).required().messages({
    "string.pattern.base": "Invalid name format. Only letters, spaces, hyphens, and dots allowed."
  }),
  employee_id: Joi.string().required(),
  joining_date: Joi.date().allow("").optional(),
  phone: Joi.string().required(),
  designation: Joi.string().allow(""),
  department: Joi.string().allow(""),
  
  branch: objectId.required(),
  role: objectId.required(),
  
  facebook: Joi.string().allow("").optional(),
  linkedin: Joi.string().allow("").optional(),
  twitter: Joi.string().allow("").optional(),
  instagram: Joi.string().allow("").optional(),
  others: Joi.string().allow("").optional(),
  
  photo: Joi.any().optional()
}); // Strict: No .unknown(true)

export const updateUserSchema = Joi.object({
  full_name: Joi.string().pattern(nameRegex).messages({
    "string.pattern.base": "Invalid name format. Only letters, spaces, hyphens, and dots allowed."
  }),
  email: Joi.string().email().lowercase(),
  username: Joi.string().alphanum().min(3).max(30),
  phone: Joi.string(),
  designation: Joi.string().allow("").optional(),
  department: Joi.string().allow("").optional(),
  status: Joi.string().valid("Active", "On Leave", "Resigned"),
  
  branch: objectId.optional(),
  role: objectId.optional(),
  
  employee_id: Joi.string().allow("").optional(),
  joining_date: Joi.date().allow("").optional(),
  
  facebook: Joi.string().allow("").optional(),
  linkedin: Joi.string().allow("").optional(),
  twitter: Joi.string().allow("").optional(),
  instagram: Joi.string().allow("").optional(),
  others: Joi.string().allow("").optional(),

  photo: Joi.any().optional()
}).min(1);

export const roleUpdateSchema = Joi.object({
  role: objectId.required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().optional(),
  password: Joi.string().required()
}).or('email', 'username');