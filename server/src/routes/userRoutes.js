import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users/:id
router.get("/:id", authenticateToken, (req, res) => {
  // Get user by ID
  res.json({ message: "Get user route" });
});

// PUT /api/users/:id
router.put("/:id", authenticateToken, (req, res) => {
  // Update user
  res.json({ message: "Update user route" });
});

// GET /api/users
router.get("/", authenticateToken, authorize(["admin"]), (req, res) => {
  // Get all users (admin only)
  res.json({ message: "Get all users route" });
});

// DELETE /api/users/:id
router.delete("/:id", authenticateToken, authorize(["admin"]), (req, res) => {
  // Delete user (admin only)
  res.json({ message: "Delete user route" });
});

export default router;
