import dotenv from "dotenv";
import { z } from "zod";

/* ================= LOAD ENV ================= */

dotenv.config();

/* ================= ENV SCHEMA ================= */

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  PUBLIC_BASE_URL: z.string().optional(),
});

/* ================= VALIDATE ENV ================= */

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

/* ================= EXPORT ================= */

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((o) => o.trim())
  .filter(Boolean);