import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import Assignment from "../models/Assignment.js";

const router = express.Router();

/* ============================
   GET ASSIGNMENTS
   GET /api/assignments
============================ */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? {}
        : { userId: req.user._id.toString() };

    const items = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GET ASSIGNMENT BY ID
   GET /api/assignments/:id
============================ */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Assignment.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Owner or admin only
    if (
      req.user.role !== "admin" &&
      item.userId !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   CREATE ASSIGNMENT
   POST /api/assignments
============================ */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, course, dueDate, type, status, priority, userId } =
      req.body || {};

    if (!title || !course || !dueDate || !type || !status || !priority) {
      return res.status(400).json({ error: "All fields required" });
    }

    const targetUserId =
      req.user.role === "admin" || req.user.role === "instructor"
        ? String(userId || req.user._id)
        : req.user._id.toString();

    const created = await Assignment.create({
      title: String(title).trim(),
      course: String(course).trim(),
      dueDate: String(dueDate),
      type: String(type),
      status: String(status),
      priority: String(priority),
      userId: String(targetUserId),
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   UPDATE ASSIGNMENT
   PUT /api/assignments/:id
============================ */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Assignment.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Owner or admin/instructor only
    const isOwner = item.userId === req.user._id.toString();
    const canEdit =
      isOwner || req.user.role === "admin" || req.user.role === "instructor";

    if (!canEdit) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const allowed = ["title", "course", "dueDate", "type", "status", "priority"];
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) {
        item[key] = req.body[key];
      }
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   DELETE ASSIGNMENT
   DELETE /api/assignments/:id
============================ */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const deleted = await Assignment.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
