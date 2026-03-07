import Joi from "joi";

// ১. প্রতিটা সিঙ্গেল টপিক অবজেক্টের জন্য কমন রুলস
const topicItemSchema = Joi.object({
  topic: Joi.string().required().trim().messages({
    "string.empty": "Topic name cannot be empty",
  }),
  category: Joi.string().required().trim().messages({
    "any.required": "Category is required for each topic",
  }),
  class_type: Joi.string()
    .valid("Lecture", "Lab", "Exam", "Review", "Orientation")
    .default("Lecture"),
  order_index: Joi.number().integer().min(1).required().messages({
    "number.base": "Class number must be a valid number",
    "any.required": "Order index (Class Number) is missing",
  }),
  description: Joi.string().allow("").optional(),
});

// ==========================================
// 🚀 Create Schema: Supports both Single Object & Array
// ==========================================
export const masterSyllabusCreateSchema = Joi.alternatives().try(
  topicItemSchema,           // যদি ১টা অবজেক্ট পাঠাস
  Joi.array().items(topicItemSchema).min(1) // যদি অনেকগুলো টপিক (Array) পাঠাস
);

// ==========================================
// 🚀 Update Schema: Single Topic Update
// ==========================================
export const masterSyllabusUpdateSchema = Joi.object({
  topic: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  class_type: Joi.string().valid("Lecture", "Lab", "Exam", "Review", "Orientation").optional(),
  order_index: Joi.number().integer().min(1).optional(),
  description: Joi.string().allow("").optional(),
}).min(1);