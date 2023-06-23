import { z } from "zod";

export const UsernameSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
});

export type Username = z.infer<typeof UsernameSchema>;
