import { z } from "zod";

const topicItemSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required"),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().optional().default(""),
  class_type: z.enum(["Lecture", "Lab", "Assessment", "Exam", "Review", "Orientation", "Other"]).default("Lecture"),
  order_index: z.coerce.number().int().nonnegative("Order index must be a positive number")
});

export const createMasterSyllabusSchema = z.union([
  z.array(topicItemSchema).min(1),
  topicItemSchema
]);

export const updateMasterSyllabusSchema = z.object({
  topic: z.string().trim().optional(),
  category: z.string().trim().optional(),
  description: z.string().optional(),
  class_type: z.enum(["Lecture", "Lab", "Assessment", "Exam", "Review", "Orientation", "Other"]).optional(),
  order_index: z.coerce.number().int().nonnegative().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field is required to update",
});