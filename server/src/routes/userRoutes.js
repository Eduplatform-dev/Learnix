import express from "express";
import User from "../models/User.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* =====================================================
   GET USER BY ID
   GET /api/users/:id
===================================================== */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user)
      return res.status(404).json({ error: "User not found" });

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
    // user can update only self unless admin
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   GET ALL USERS (ADMIN ONLY)
   GET /api/users
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