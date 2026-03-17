// server/src/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import { authenticateToken, authorize } from "../middleware/auth.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* =====================================================
   GET ALL USERS (ADMIN ONLY)
   GET /api/users
   ⚠️ MUST be defined BEFORE GET /:id — Express matches
      routes in order. If /:id comes first it consumes
      the empty-string segment and the list route is unreachable.
===================================================== */
router.get(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (_req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   CREATE USER (ADMIN ONLY)
   POST /api/users
===================================================== */
router.post(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { email, password, username, role } = req.body || {};

      if (!email || !password || !username) {
        return res.status(400).json({ error: "All fields required" });
      }

      const exists = await User.findOne({ email: String(email).toLowerCase() });
      if (exists) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      const allowedRoles = ["student", "instructor", "admin"];
      const safeRole = allowedRoles.includes(role) ? role : "student";

      const user = await User.create({
        email: String(email).toLowerCase(),
        username: String(username).trim(),
        password: hashedPassword,
        role: safeRole,
      });

      res.status(201).json({
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   GET USER BY ID
   GET /api/users/:id
===================================================== */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   UPDATE USER
   PUT /api/users/:id
===================================================== */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates = {};

    if (req.body?.username !== undefined) {
      updates.username = String(req.body.username).trim();
    }
    if (req.body?.email !== undefined) {
      updates.email = String(req.body.email).toLowerCase().trim();
    }
    if (req.body?.password !== undefined) {
      updates.password = await bcrypt.hash(String(req.body.password), 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   UPDATE ROLE (ADMIN ONLY)
   PATCH /api/users/:id
===================================================== */
router.patch(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body || {};
      const allowedRoles = ["student", "instructor", "admin"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =====================================================
   DELETE USER (ADMIN ONLY)
   DELETE /api/users/:id
===================================================== */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
