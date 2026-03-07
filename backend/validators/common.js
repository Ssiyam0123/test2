import Joi from "joi";

export const objectId = Joi.string().hex().length(24);import { z } from "zod";
import mongoose from "mongoose";

// Helper to validate MongoDB ObjectId using Zod
export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId format",
});