// server/src/index.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import fs from "node:fs";
import path from "node:path";

import { connectDB } from "./config/db.js";
import { corsOrigins, env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";   // ← NEW
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = env.PORT;

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

/* ─── GLOBAL MIDDLEWARE ─────────────────────────────── */
app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: env.NODE_ENV === "production" ? 80 : 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ─── STATIC UPLOADS ────────────────────────────────── */
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

/* ─── ROUTES ─────────────────────────────────────────── */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/submissions", submissionRoutes);   // ← NEW

/* ─── HEALTH ─────────────────────────────────────────── */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ─── ERRORS ─────────────────────────────────────────── */
app.use(notFound);
app.use(errorHandler);

/* ─── START ──────────────────────────────────────────── */
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
