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
  
  // Flat social links from the frontend
  facebook: Joi.string().allow("").optional(),
  linkedin: Joi.string().allow("").optional(),
  twitter: Joi.string().allow("").optional(),
  instagram: Joi.string().allow("").optional(),
  others: Joi.string().allow("").optional(),
  
  photo: Joi.any().optional(),
  photo_url: Joi.string().allow("").optional()
}).unknown(true); // Allows div-basic, div-job, etc. to pass without crashing


export const updateUserSchema = Joi.object({
  full_name: Joi.string().pattern(nameRegex).messages({
    "string.pattern.base": "Invalid name format. Only letters, spaces, hyphens, and dots allowed."
  }),
  email: Joi.string().email().lowercase(),
  username: Joi.string().alphanum().min(3).max(30),
  phone: Joi.string(),
  designation: Joi.string().allow(""),
  department: Joi.string().allow(""),
  status: Joi.string().valid("Active", "On Leave", "Resigned"),
  
  branch: objectId,
  
  // 🚀 PBAC FIX: Allow ObjectId updates for roles
  role: objectId,
  
  employee_id: Joi.string().allow("").optional(),
  joining_date: Joi.date().allow("").optional(),
  
  // Flat social links
  facebook: Joi.string().allow("").optional(),
  linkedin: Joi.string().allow("").optional(),
  twitter: Joi.string().allow("").optional(),
  instagram: Joi.string().allow("").optional(),
  others: Joi.string().allow("").optional(),

  photo: Joi.any().optional(),
  photo_url: Joi.string().allow("").optional()
}).unknown(true).min(1); // Unknown(true) ignores the UI artifacts


export const roleUpdateSchema = Joi.object({
  // 🚀 PBAC FIX: Role updates via UI dropdown must send a valid MongoDB ObjectId
  role: objectId.required()
});

export const loginSchema = Joi.object({
  // Allow the frontend to send either email or username
  email: Joi.string().email().optional(),
  username: Joi.string().optional(),
  password: Joi.string().required()
}).or('email', 'username'); // Joi rule: At least one of these two MUST be provided