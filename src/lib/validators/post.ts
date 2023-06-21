import { z } from "zod";

export const PostSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title must be shorter than 128 characters" }),
  subredditId: z.string(),
  content: z.any(),
});

export type PostSchemaValidator = z.infer<typeof PostSchema>;
