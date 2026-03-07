import Joi from "joi";

const topicItemSchema = Joi.object({
  topic: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().allow("").optional(),
  class_type: Joi.string().valid("Lecture", "Lab", "Assessment", "Other").default("Lecture"),
  order_index: Joi.number().min(0).optional()
});

// 🚀 Supports both a single object OR an array of objects (Bulk insert)
export const createMasterSyllabusSchema = Joi.alternatives().try(
  Joi.array().items(topicItemSchema).min(1),
  topicItemSchema
);

export const updateMasterSyllabusSchema = Joi.object({
  topic: Joi.string().trim().optional(),
  category: Joi.string().trim().optional(),
  description: Joi.string().allow("").optional(),
  class_type: Joi.string().valid("Lecture", "Lab", "Assessment", "Other").optional(),
  order_index: Joi.number().min(0).optional()
}).min(1);