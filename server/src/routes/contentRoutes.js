import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/content
router.get("/", authenticateToken, (req, res) => {
  // Get all content
  res.json({ message: "Get all content route" });
});

// GET /api/content/:id
router.get("/:id", authenticateToken, (req, res) => {
  // Get content by ID
  res.json({ message: "Get content by ID route" });
});

// POST /api/content
router.post("/", authenticateToken, authorize(["admin", "instructor"]), (req, res) => {
  // Create new content
  res.json({ message: "Create content route" });
});

// PUT /api/content/:id
router.put("/:id", authenticateToken, authorize(["admin", "instructor"]), (req, res) => {
  // Update content
  res.json({ message: "Update content route" });
});

// DELETE /api/content/:id
router.delete("/:id", authenticateToken, authorize(["admin"]), (req, res) => {
  // Delete content
  res.json({ message: "Delete content route" });
});

export default router;
