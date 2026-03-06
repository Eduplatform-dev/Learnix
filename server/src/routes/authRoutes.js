import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

import User from "../models/User.js";
import { env } from "../config/env.js";

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(2).max(60),
  role: z.enum(["student", "instructor", "admin"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createAuthPayload = (user) => ({
  _id: user._id,
  email: user.email,
  username: user.username,
  role: user.role,
});

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid registration payload" });
    }

    const { email, password, username } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration always creates student accounts.
    const user = await User.create({
      email: normalizedEmail,
      username: username.trim(),
      password: hashedPassword,
      role: "student",
    });

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: createAuthPayload(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid login payload" });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: createAuthPayload(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

