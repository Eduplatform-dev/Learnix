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

/* ================= ROUTES ================= */

import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";

/* ================= GLOBAL MIDDLEWARE ================= */

app.use(helmet());
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* Rate limiter AFTER json parser */
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  })
);

/* ================= AUTH MIDDLEWARE ================= */

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(401).json({ error: "User not found" });

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* ================= AUTH ROUTES ================= */

/* REGISTER */
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username)
      return res.status(400).json({ error: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const allowedRoles = ["student", "instructor", "admin"];

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      role: allowedRoles.includes(role) ? role : "student",
    });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

/* LOGIN */
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ error: "Invalid email" });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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

/* ================= PROTECTED ROUTES ================= */

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

/* ASSIGNMENTS */
app.get("/api/assignments", authenticateToken, async (req, res) => {
  try {
    const items = await Assignment.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= HEALTH ================= */

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ================= START ================= */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});