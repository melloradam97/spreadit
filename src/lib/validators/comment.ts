import { z } from "zod";

export const CommentSchema = z.object({
  postId: z.string(),
  text: z.string().min(1).max(1000),
  replyToId: z.string().optional(),
});

export type CommentSchemaType = z.infer<typeof CommentSchema>;
