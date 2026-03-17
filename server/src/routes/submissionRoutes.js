// server/src/routes/submissionRoutes.js
import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { authenticateToken, authorize } from "../middleware/auth.js";
import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";
import { env } from "../config/env.js";

const router = express.Router();

/* ─── FILE UPLOAD SETUP ────────────────────────────── */
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
      "text/plain",
      "image/png",
      "image/jpeg",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const baseUrl = (req) =>
  env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;

/* ─── GET MY SUBMISSIONS (student) ─────────────────── */
/* GET /api/submissions */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" || req.user.role === "instructor"
        ? {}
        : { studentId: req.user._id };

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET SUBMISSIONS FOR AN ASSIGNMENT ─────────────── */
/* GET /api/submissions/assignment/:assignmentId */
router.get("/assignment/:assignmentId", authenticateToken, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" || req.user.role === "instructor"
        ? { assignmentId: req.params.assignmentId }
        : { assignmentId: req.params.assignmentId, studentId: req.user._id };

    const submissions = await Submission.find(query).sort({ createdAt: -1 }).lean();
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── GET SINGLE SUBMISSION ─────────────────────────── */
/* GET /api/submissions/:id */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id).lean();
    if (!sub) return res.status(404).json({ error: "Submission not found" });

    const isOwner = String(sub.studentId) === String(req.user._id);
    const isStaff = ["admin", "instructor"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── CREATE / SAVE DRAFT ───────────────────────────── */
/* POST /api/submissions
   multipart/form-data: assignmentId, title, description, text, status, files[]
*/
router.post(
  "/",
  authenticateToken,
  upload.array("files", 10),
  async (req, res) => {
    try {
      const { assignmentId, title, description, text, status } = req.body || {};

      if (!assignmentId) {
        return res.status(400).json({ error: "assignmentId is required" });
      }

      // Verify the assignment exists and belongs to this student (or admin)
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const isOwner = assignment.userId === String(req.user._id);
      const isStaff = ["admin", "instructor"].includes(req.user.role);
      if (!isOwner && !isStaff) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Build file list
      const files = (req.files || []).map((f) => ({
        originalName: f.originalname,
        filename: f.filename,
        url: `${baseUrl(req)}/uploads/${f.filename}`,
        size: f.size,
      }));

      const submissionStatus = status === "submitted" ? "submitted" : "draft";

      const sub = await Submission.create({
        assignmentId,
        assignmentTitle: assignment.title,
        course: assignment.course,
        studentId: req.user._id,
        studentName: req.user.username || req.user.email,
        title: String(title || "").trim(),
        description: String(description || "").trim(),
        text: String(text || "").trim(),
        files,
        status: submissionStatus,
      });

      // If submitting (not draft), update the assignment status too
      if (submissionStatus === "submitted") {
        await Assignment.findByIdAndUpdate(assignmentId, { status: "Submitted" });
      }

      res.status(201).json(sub);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── UPDATE SUBMISSION (student can edit draft) ─────── */
/* PUT /api/submissions/:id */
router.put(
  "/:id",
  authenticateToken,
  upload.array("files", 10),
  async (req, res) => {
    try {
      const sub = await Submission.findById(req.params.id);
      if (!sub) return res.status(404).json({ error: "Submission not found" });

      const isOwner = String(sub.studentId) === String(req.user._id);
      const isStaff = ["admin", "instructor"].includes(req.user.role);

      if (!isOwner && !isStaff) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Students can only edit drafts
      if (isOwner && !isStaff && sub.status !== "draft") {
        return res.status(400).json({ error: "Cannot edit a submitted submission" });
      }

      if (req.body?.title !== undefined) sub.title = String(req.body.title).trim();
      if (req.body?.description !== undefined) sub.description = String(req.body.description).trim();
      if (req.body?.text !== undefined) sub.text = String(req.body.text).trim();

      // Append new files
      const newFiles = (req.files || []).map((f) => ({
        originalName: f.originalname,
        filename: f.filename,
        url: `${baseUrl(req)}/uploads/${f.filename}`,
        size: f.size,
      }));
      sub.files.push(...newFiles);

      if (req.body?.status === "submitted") {
        sub.status = "submitted";
        await Assignment.findByIdAndUpdate(sub.assignmentId, { status: "Submitted" });
      }

      await sub.save();
      res.json(sub);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── GRADE SUBMISSION (admin/instructor only) ───────── */
/* PATCH /api/submissions/:id/grade */
router.patch(
  "/:id/grade",
  authenticateToken,
  authorize(["admin", "instructor"]),
  async (req, res) => {
    try {
      const { grade, feedback } = req.body || {};

      if (!grade) {
        return res.status(400).json({ error: "grade is required" });
      }

      const sub = await Submission.findByIdAndUpdate(
        req.params.id,
        {
          grade: String(grade).trim(),
          feedback: String(feedback || "").trim(),
          status: "graded",
          gradedAt: new Date(),
          gradedBy: req.user._id,
        },
        { new: true }
      );

      if (!sub) return res.status(404).json({ error: "Submission not found" });

      res.json(sub);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ─── DELETE SUBMISSION (admin only) ────────────────── */
/* DELETE /api/submissions/:id */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const sub = await Submission.findById(req.params.id);
      if (!sub) return res.status(404).json({ error: "Submission not found" });

      // Delete uploaded files from disk
      for (const file of sub.files) {
        const filePath = path.join(uploadDir, file.filename);
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch {
          // ignore missing file
        }
      }

      await sub.deleteOne();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
