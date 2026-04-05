import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { env } from "../config/env.js";
import AuditLog from "../models/AuditLog.js";
import StudentProfile from "../models/StudentProfile.js";

/* ── Optional Activity logging ── */
let Activity = null;
try {
  const mod = await import("../models/Activity.js");
  Activity = mod.default;
} catch {
  // Activity model not present — skip logging
}

const logActivity = async (userId, action, details) => {
  if (!Activity) return;
  try {
    await Activity.create({ user: userId, action, resource: "auth", details });
  } catch {
    // Never let logging crash the auth flow
  }
};

const registerSchema = z.object({
  email:    z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role:     z.enum(["student", "instructor", "admin"]).optional().default("student"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(1, "Password is required"),
  enrollmentNumber: z.string().optional(),
});

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, username, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const [emailExists, usernameExists] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username }),
    ]);

    if (emailExists)    return res.status(409).json({ error: "Email already registered" });
    if (usernameExists) return res.status(409).json({ error: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      username,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });
    await logActivity(user._id, "register", "User account created");

    res.status(201).json({
      token,
      user: { _id: user._id, id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { email, password, enrollmentNumber } = parsed.data;
    const normalizedEmail = email?.toLowerCase().trim();

    let user;

    if (enrollmentNumber) {
      const profile = await StudentProfile
        .findOne({ enrollmentNumber })
        .populate("user");

      user = profile?.user;

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      user = await User.findById(user._id).select("+password");
    } else {
      user = await User.findOne({ email: normalizedEmail }).select("+password");
    }

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });

    await logActivity(user._id, "login", "User logged in");

    // ✅ YOUR REQUIRED ADDITION (audit log)
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "LOGIN",
      resource: "auth",
      resourceId: String(user._id),
      details: `User logged in from ${req.ip}`,
      status: "success",
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    }).catch(() => {});

    res.json({
      token,
      user: { _id: user._id, id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};