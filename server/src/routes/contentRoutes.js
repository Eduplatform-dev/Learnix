import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import Content from "../models/Content.js";
import { env } from "../config/env.js";

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/* ============================
   GET ALL CONTENT
   GET /api/content
============================ */
router.get("/", authenticateToken, async (_req, res) => {
  try {
    const items = await Content.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GET COURSE CONTENT
   GET /api/content/course/:courseId
============================ */
router.get("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const items = await Content.find({ course: req.params.courseId }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   GET CONTENT BY ID
   GET /api/content/:id
============================ */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const item = await Content.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   CREATE CONTENT (UPLOAD)
   POST /api/content
   multipart/form-data: title, type, file, (course?), (folder?)
============================ */
router.post(
  "/",
  authenticateToken,
  authorize(["admin", "instructor"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const title = String(req.body?.title || "").trim();
      const type = String(req.body?.type || "");
      const course = req.body?.course ? String(req.body.course) : null;
      const folder = req.body?.folder ? String(req.body.folder) : null;

      if (!title || !type || !req.file) {
        if (req.file?.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch {
            // ignore
          }
        }

        return res.status(400).json({ error: "Title, type and file required" });
      }

      const allowedTypes = ["video", "pdf", "image"];
      if (!allowedTypes.includes(type)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({ error: "Invalid content type" });
      }

      const baseUrl = env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;

      const url = `${baseUrl}/uploads/${req.file.filename}`;

      const created = await Content.create({
        title,
        type,
        url,
        course,
        folder,
        uploadedBy: req.user._id,
        filePath: req.file.path,
      });

      res.status(201).json(created);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ============================
   UPDATE CONTENT
   PUT /api/content/:id
============================ */
router.put(
  "/:id",
  authenticateToken,
  authorize(["admin", "instructor"]),
  async (req, res) => {
    try {
      const item = await Content.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }

      if (req.body?.title !== undefined) {
        item.title = String(req.body.title).trim();
      }

      if (req.body?.course !== undefined) {
        item.course = req.body.course ? String(req.body.course) : null;
      }

      if (req.body?.folder !== undefined) {
        item.folder = req.body.folder ? String(req.body.folder) : null;
      }

      await item.save();
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ============================
   DELETE CONTENT
   DELETE /api/content/:id
============================ */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const item = await Content.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }

      const filePath = item.filePath;

      await item.deleteOne();

      if (filePath) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore missing file
        }
      }

      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
