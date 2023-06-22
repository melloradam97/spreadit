import { z } from "zod";

export const VoteSchema = z.object({
  postId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type VoteSchemaType = z.infer<typeof VoteSchema>;

export const CommentSchema = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentSchemaType = z.infer<typeof CommentSchema>;
