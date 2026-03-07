import { z } from "zod";
import { objectIdSchema } from "./common.js";

const daysEnum = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const objectIdArraySchema = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.trim() === "" ? [] : val.split(",").map((s) => s.trim());
  }
  return [];
}, z.array(objectIdSchema).optional().default([]));

const scheduleDaysSchema = z.preprocess((val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    return val.trim() === "" ? [] : val.split(",").map((s) => s.trim());
  }
  return [];
}, z.array(daysEnum).min(1));

export const batchCreateSchema = z.object({
  batch_name: z.string().trim().min(1),
  course: objectIdSchema,
  branch: objectIdSchema.optional(),

  instructors: objectIdArraySchema,

  start_date: z.string().min(1),
  end_date: z.string().nullable().optional(),

  time_slot: z.object({
    start_time: z.string().min(1),
    end_time: z.string().min(1),
  }),

  schedule_days: scheduleDaysSchema,

  status: z
    .enum(["Upcoming", "Active", "Completed", "On Hold"])
    .default("Upcoming"),
});

export const batchUpdateSchema = z
  .object({
    batch_name: z.string().trim().optional(),
    course: objectIdSchema.optional(),

    instructors: objectIdArraySchema.optional(),

    start_date: z.string().optional(),
    end_date: z.string().nullable().optional(),

    time_slot: z
      .object({
        start_time: z.string().optional(),
        end_time: z.string().optional(),
      })
      .optional(),

    schedule_days: scheduleDaysSchema.optional(),

    status: z.enum(["Upcoming", "Active", "Completed"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });
