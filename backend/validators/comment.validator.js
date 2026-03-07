import { z } from "zod";

export const commentCreateSchema = z.object({
  text: z.string().trim().min(1, "Comment text cannot be empty.")
});