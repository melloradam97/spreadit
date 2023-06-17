import { z } from "zod";

export const SubredditSchema = z.object({
  name: z.string().min(3).max(20),
});

export const SubredditSubscriptionSchema = z.object({
  subredditId: z.string().uuid(),
});

export type CreateSubredditPayload = z.infer<typeof SubredditSchema>;
export type SubscribeTpSubredditPayload = z.infer<
  typeof SubredditSubscriptionSchema
>;
