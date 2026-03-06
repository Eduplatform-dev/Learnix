import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import Course from "../models/Course.js";

const router = express.Router();

/* ============================
   GET ALL COURSES
   GET /api/courses
============================ */
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GET COURSE BY ID
   GET /api/courses/:id
============================ */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   CREATE COURSE (ADMIN)
   POST /api/courses
============================ */
router.post(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { title, instructor, duration, image } = req.body || {};

      if (!title || !instructor || !duration) {
        return res.status(400).json({ error: "All fields required" });
      }

      const course = await Course.create({
        title: String(title).trim(),
        instructor: String(instructor).trim(),
        duration: String(duration).trim(),
        image: image ? String(image) : "",
        students: 0,
        rating: 4.5,
        progress: 0,
        status: "Not Started",
      });

      res.status(201).json(course);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ============================
   UPDATE COURSE (ADMIN)
   PUT /api/courses/:id
============================ */
router.put(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ============================
   DELETE COURSE (ADMIN)
   DELETE /api/courses/:id
============================ */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const deleted = await Course.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
