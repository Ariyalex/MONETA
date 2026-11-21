import z from "zod";

// validasi payload login administrator
export const loginSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username is required")
      .max(100, "Username is too long"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password is too long"),
  })
  .strict();

// TypeScript type berdasarkan Zod schema.
export type LoginInput = z.infer<typeof loginSchema>;
