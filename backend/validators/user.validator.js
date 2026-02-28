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
  role: Joi.string().valid("admin", "instructor", "register", "staff", "user").default("user"),
  
  // Flat social links from the frontend
  facebook: Joi.string().allow("").optional(),
  linkedin: Joi.string().allow("").optional(),
  twitter: Joi.string().allow("").optional(),
  instagram: Joi.string().allow("").optional(),
  others: Joi.string().allow("").optional(),
  
  photo: Joi.any().optional(),
  photo_url: Joi.string().allow("").optional()
}).unknown(true); // Allows div-basic, div-job, etc. to pass without crashing


export const userUpdateSchema = Joi.object({
  full_name: Joi.string().pattern(nameRegex).messages({
    "string.pattern.base": "Invalid name format. Only letters, spaces, hyphens, and dots allowed."
  }),
  email: Joi.string().email().lowercase(),
  username: Joi.string().alphanum().min(3).max(30),
  phone: Joi.string(),
  designation: Joi.string().allow(""),
  department: Joi.string().allow(""),
  status: Joi.string().valid("Active", "On Leave", "Resigned"),
  role: Joi.string().valid("superadmin","admin", "instructor", "register", "staff", "user"),
  branch: objectId,
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
  role: Joi.string().valid("admin", "instructor", "register", "staff", "user").required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});