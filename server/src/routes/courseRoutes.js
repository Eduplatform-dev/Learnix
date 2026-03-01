import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/courses
router.get("/", (req, res) => {
  // Get all courses
  res.json({ message: "Get all courses route" });
});

// GET /api/courses/:id
router.get("/:id", (req, res) => {
  // Get course by ID
  res.json({ message: "Get course by ID route" });
});

// POST /api/courses
router.post("/", authenticateToken, authorize(["admin"]), (req, res) => {
  // Create new course
  res.json({ message: "Create course route" });
});

// PUT /api/courses/:id
router.put("/:id", authenticateToken, authorize(["admin"]), (req, res) => {
  // Update course
  res.json({ message: "Update course route" });
});

// DELETE /api/courses/:id
router.delete("/:id", authenticateToken, authorize(["admin"]), (req, res) => {
  // Delete course
  res.json({ message: "Delete course route" });
});

export default router;
