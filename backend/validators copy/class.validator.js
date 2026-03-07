import Joi from "joi";
import { objectId } from "./common.js";

const classItemSchema = Joi.object({
  topic: Joi.string().trim().required(),
  order_index: Joi.number().min(1).optional(),
  class_number: Joi.number().min(1).optional(),
  class_type: Joi.string().valid("Lecture", "Lab", "Assessment", "Other").default("Lecture"),
  description: Joi.string().allow("").optional()
});

// Supports both array of classes or a single class object
export const addClassSchema = Joi.alternatives().try(
  Joi.array().items(classItemSchema).min(1),
  classItemSchema
);

export const updateClassContentSchema = Joi.object({
  topic: Joi.string().trim().optional(),
  class_type: Joi.string().optional(),
  content_details: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).optional(),
  is_completed: Joi.boolean().optional()
});

export const scheduleClassSchema = Joi.object({
  date_scheduled: Joi.date().iso().required()
});

export const updateAttendanceSchema = Joi.object({
  attendanceRecords: Joi.array().items(
    Joi.object({
      student: objectId.required(),
      status: Joi.string().valid("Present", "Absent", "Late", "Excused").required(),
      remarks: Joi.string().allow("").optional()
    })
  ).required(),
  instructorId: objectId.optional(),
  is_completed: Joi.boolean().optional(),
  financials: Joi.object({
    actual_cost: Joi.number().min(0).required(),
    expense_notes: Joi.string().allow("").optional()
  }).optional()
});