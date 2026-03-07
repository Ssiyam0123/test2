import Joi from "joi";
import { objectId } from "./common.js";

export const batchSchema = Joi.object({
  batch_name: Joi.string().required().trim(),
  course: objectId.required(),
  instructors: Joi.array().items(objectId).default([]),
  branch: objectId.required(),
  start_date: Joi.date().required(),
  schedule_days: Joi.array()
    .items(
      Joi.string().valid(
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ),
    )
    .min(1)
    .required(),

  time_slot: Joi.object({
    start_time: Joi.string().required(),
    end_time: Joi.string().required(),
  }).required(),

  status: Joi.string()
    .valid("Active", "Upcoming", "Completed", "Inactive")
    .default("Upcoming"),
});

export const classAttendanceSchema = Joi.object({
  attendanceRecords: Joi.array()
    .items(
      Joi.object({
        student: objectId.required(),
        status: Joi.string().valid("present", "absent").required(),
      }),
    )
    .required(),
  instructorId: objectId.allow(null).optional(),
  is_completed: Joi.boolean().optional(),
  financials: Joi.object({
    budget: Joi.number().min(0).optional(),
    actual_cost: Joi.number().min(0).optional(),
    expense_notes: Joi.string().allow("").optional(),
  }).optional(),
});

export const requisitionSchema = Joi.object({
  requisition: Joi.array()
    .items(
      Joi.object({
        item_name: Joi.string().required().trim(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string()
          .valid("kg", "g", "L", "ml", "pcs", "pkt", "box", "dozen")
          .required(),
      }),
    )
    .min(1)
    .required(),
});
