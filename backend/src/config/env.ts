import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  FRONTEND_ORIGIN: z.url().default("http://localhost:80"),
  AI_SERVICE_URL: z.url(),
  TARGET_DIR: z.string().min(1).default("/app/targets"),
});

export const env = envSchema.parse(process.env);
