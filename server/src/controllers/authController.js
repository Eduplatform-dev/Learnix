import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import RefreshToken from "../models/RefreshToken.js";
import { env, jwtRefreshSecret } from "../config/env.js";

/* ── Optional audit logging ── */
let AuditLog = null;
try {
  const mod = await import("../models/AuditLog.js");
  AuditLog = mod.default;
} catch { /* skip */ }

// FIX: guard against null userId — AuditLog.actor is required
const logAudit = async (req, userId, email, role, action, details, status = "success") => {
  if (!AuditLog) return;
  if (!userId) return; // cannot log without a valid actor
  try {
    await AuditLog.create({
      actor:      userId,
      actorEmail: email,
      actorRole:  role,
      action,
      resource:   "auth",
      resourceId: String(userId),
      details,
      ip:         req.ip || req.connection?.remoteAddress || "",
      userAgent:  req.get("user-agent") || "",
      status,
    });
  } catch { /* never crash auth */ }
};

/* ── Cookie helpers ────────────────────────────────────── */

// 14-day refresh token stored in a Secure, HttpOnly, SameSite=Strict cookie.
// JavaScript on the page cannot read this cookie, which eliminates the
// main XSS attack vector against refresh tokens.
const REFRESH_TOKEN_TTL_MS  = 14 * 24 * 60 * 60 * 1000; // 14 days
const ACCESS_TOKEN_TTL_SEC  = 15 * 60;                   // 15 minutes

const setRefreshCookie = (res, rawToken) => {
  res.cookie("refreshToken", rawToken, {
    httpOnly: true,
    secure:   env.NODE_ENV === "production",   // HTTPS only in prod
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge:   REFRESH_TOKEN_TTL_MS,
    path:     "/api/auth",   // cookie is only sent to auth endpoints
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure:   env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path:     "/api/auth",
  });
};

/** Issue a short-lived JWT access token (15 min) */
const signAccess = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL_SEC }
  );

/** Save a new refresh token record and set the cookie */
const issueRefreshToken = async (res, req, user) => {
  const raw  = RefreshToken.generate();
  const hash = RefreshToken.hash(raw);

  await RefreshToken.create({
    user:      user._id,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: req.get("user-agent") || "",
    ip:        req.ip || "",
  });

  setRefreshCookie(res, raw);
  return raw;
};

/* ── Schemas ─────────────────────────────────────────── */
const registerSchema = z.object({
  email:    z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role:     z.enum(["student", "instructor", "admin"]).optional().default("student"),
});

const loginSchema = z.object({
  email:            z.string().email().optional(),
  enrollmentNumber: z.string().optional(),
  password:         z.string().min(1, "Password is required"),
}).refine(d => d.email || d.enrollmentNumber, {
  message: "Either email or enrollment number is required",
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
      email: normalizedEmail, username, password: hashedPassword, role,
    });

    const accessToken = signAccess(user);
    await issueRefreshToken(res, req, user);

    await logAudit(req, user._id, user.email, user.role, "REGISTER", "New account registered");

    res.status(201).json({
      accessToken,
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

    const { email, enrollmentNumber, password } = parsed.data;
    let user;

    if (enrollmentNumber) {
      const profile = await StudentProfile.findOne({
        enrollmentNumber: enrollmentNumber.trim(),
      });
      if (!profile) {
        // FIX: don't call logAudit with null userId — just return 401
        return res.status(401).json({ error: "Invalid credentials" });
      }
      user = await User.findById(profile.user).select("+password");
    } else {
      const normalizedEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: normalizedEmail }).select("+password");
    }

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logAudit(req, user._id, user.email, user.role, "LOGIN_FAILED", "Wrong password", "failure");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccess(user);
    await issueRefreshToken(res, req, user);

    await logAudit(req, user._id, user.email, user.role, "LOGIN",
      enrollmentNumber ? "Login via enrollment number" : "Login via email");

    res.json({
      accessToken,
      user: { _id: user._id, id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= REFRESH ================= */
// Called by the frontend silently to get a new access token.
// The refresh token arrives only via the httpOnly cookie — never in a header.
export const refresh = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ error: "No refresh token" });

    const hash  = RefreshToken.hash(raw);
    const record = await RefreshToken.findOne({ tokenHash: hash });

    if (!record)             return res.status(401).json({ error: "Invalid refresh token" });
    if (record.revoked)      return res.status(401).json({ error: "Refresh token revoked" });
    if (record.expiresAt < new Date()) {
      await record.deleteOne();
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const user = await User.findById(record.user);
    if (!user) {
      await record.deleteOne();
      clearRefreshCookie(res);
      return res.status(401).json({ error: "User not found" });
    }

    // Rotate: revoke used token, issue a new one (refresh token rotation)
    record.revoked   = true;
    record.revokedAt = new Date();
    await record.save();

    const accessToken = signAccess(user);
    await issueRefreshToken(res, req, user);

    res.json({
      accessToken,
      user: { _id: user._id, id: user._id, email: user.email, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("refresh error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= LOGOUT ================= */
// Revokes the current refresh token and clears the cookie.
export const logout = async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;

    if (raw) {
      const hash = RefreshToken.hash(raw);
      await RefreshToken.findOneAndUpdate(
        { tokenHash: hash },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
    }

    clearRefreshCookie(res);

    if (req.user) {
      await logAudit(req, req.user._id, req.user.email, req.user.role, "LOGOUT", "User logged out");
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("logout error:", err);
    // Always clear the cookie even on error
    clearRefreshCookie(res);
    res.json({ ok: true });
  }
};

/* ================= LOGOUT ALL ================= */
// Revokes every refresh token for the current user (logout from all devices).
export const logoutAll = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await RefreshToken.revokeAll(req.user._id);
    clearRefreshCookie(res);

    await logAudit(req, req.user._id, req.user.email, req.user.role,
      "LOGOUT_ALL", "Revoked all sessions");

    res.json({ ok: true });
  } catch (err) {
    console.error("logoutAll error:", err);
    clearRefreshCookie(res);
    res.json({ ok: true });
  }
};