import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();

/* ================= CONFIG ================= */
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

/* ================= DATABASE ================= */
mongoose
  .connect(MONGO)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });

/* ================= MODELS ================= */
import User from "./models/User.js";
import Assignment from "./models/Assignment.js";
import Course from "./models/Course.js";
import Content from "./models/Content.js";
import Folder from "./models/Folder.js";

/* ================= MIDDLEWARE ================= */
app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  })
);

/* ================= AUTH MIDDLEWARE ================= */

const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin only" });

  next();
};

/* ================= AUTH ROUTES ================= */

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashed,
      role: "student",
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= ASSIGNMENTS ================= */

// GET
app.get("/api/assignments", requireAuth, async (req, res) => {
  const items = await Assignment.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(items);
});

// CREATE
app.post("/api/assignments", requireAuth, async (req, res) => {
  const item = await Assignment.create({
    ...req.body,
    userId: req.user._id,
  });

  res.json(item);
});

// UPDATE
app.put("/api/assignments/:id", requireAuth, async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, req.body);
  res.json({ ok: true });
});

// DELETE
app.delete("/api/assignments/:id", requireAuth, async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ================= HEALTH ================= */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
