import Joi from "joi";
import { objectId } from "./common.js";

const nameRegex = /^[a-zA-Z\s\-'.]+$/;

export const studentCreateSchema = Joi.object({
  student_name: Joi.string().pattern(nameRegex).required(),
  fathers_name: Joi.string().pattern(nameRegex).required(),
  student_id: Joi.string().required(),
  registration_number: Joi.string().allow("").optional(),
  course: objectId.required(),
  batch: objectId.required(),
  branch: objectId.required(),
  gender: Joi.string().valid("male", "female").required(),
  issue_date: Joi.date().required(),
  email: Joi.string().email().allow("").optional(),
  contact_number: Joi.string().allow("").optional(),
  address: Joi.string().allow("").optional(),
  status: Joi.string().valid("active", "inactive", "completed", "discontinued", "on_leave").default("active"),
  competency: Joi.string().valid("competent", "incompetent", "not_assessed").default("not_assessed"),
  
  // ADDED: Accept discount during admission
  discount_amount: Joi.number().min(0).optional().default(0),

  completion_date: Joi.date().allow(null, "").optional(),
  is_active: Joi.boolean().optional(),
  is_verified: Joi.boolean().optional()
}).unknown(true);

export const studentUpdateSchema = studentCreateSchema.fork(
  ['student_name', 'fathers_name', 'student_id', 'course', 'batch', 'branch', 'gender', 'issue_date'], 
  (schema) => schema.optional()
).unknown(true).min(1);