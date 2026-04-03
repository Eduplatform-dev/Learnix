import express from "express";
import { z } from "zod";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

const deptSchema = z.object({
  name:        z.string().min(2).max(100).trim(),
  code:        z.string().min(2).max(10).trim(),
  description: z.string().max(500).optional().default(""),
});

/* ─── GET ALL (active) ────────────────────────────────────── */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const depts = await Department.find({ isActive: true }).sort({ name: 1 });

    // Attach student and course counts
    const enriched = await Promise.all(
      depts.map(async (dept) => {
        const [studentCount, courseCount] = await Promise.all([
          User.countDocuments({ department: dept._id, role: "student" }),
          Course.countDocuments({ department: dept._id }),
        ]);
        return { ...dept.toObject(), studentCount, courseCount };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET BY ID ───────────────────────────────────────────── */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ error: "Department not found" });

    const [studentCount, courseCount, instructorCount] = await Promise.all([
      User.countDocuments({ department: dept._id, role: "student" }),
      Course.countDocuments({ department: dept._id }),
      User.countDocuments({ department: dept._id, role: "instructor" }),
    ]);

    res.json({ ...dept.toObject(), studentCount, courseCount, instructorCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── CREATE (admin only) ─────────────────────────────────── */
router.post(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const parsed = deptSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { name, code, description } = parsed.data;

      // Check duplicate
      const existing = await Department.findOne({
        $or: [
          { name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
          { code: code.toUpperCase() },
        ],
      });
      if (existing) {
        return res.status(409).json({
          error: existing.code === code.toUpperCase()
            ? "Department code already exists"
            : "Department name already exists",
        });
      }

      const dept = await Department.create({
        name,
        code: code.toUpperCase(),
        description,
      });

      res.status(201).json(dept);
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: "Department name or code already exists" });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── UPDATE (admin only) ─────────────────────────────────── */
router.put(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const parsed = deptSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const updates = { ...parsed.data };
      if (updates.code) updates.code = updates.code.toUpperCase();

      const dept = await Department.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );
      if (!dept) return res.status(404).json({ error: "Department not found" });
      res.json(dept);
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return res.status(409).json({ error: `${field} already exists` });
      }
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── DELETE / soft deactivate (admin only) ──────────────── */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const dept = await Department.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      if (!dept) return res.status(404).json({ error: "Department not found" });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;