import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, role } = req.body;

    // check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      email,
      username,
      password: hashed,
      role: role || "student",
    });

    // ✅ include role in token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ✅ RBAC token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
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
    res.status(500).json({ error: "Server error" });
  }
});

export default router;