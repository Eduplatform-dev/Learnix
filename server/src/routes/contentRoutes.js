import express from "express";

import {
  getContent,
  getCourseContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
} from "../controllers/contentController.js";

import { authenticateToken, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ================= GET ALL ================= */
router.get(
  "/",
  authenticateToken,
  getContent
);

/* ================= GET BY COURSE ================= */
router.get(
  "/course/:courseId",
  authenticateToken,
  getCourseContent
);

/* ================= GET BY ID ================= */
router.get(
  "/:id",
  authenticateToken,
  getContentById
);

/* ================= CREATE (with optional file upload) ================= */
router.post(
  "/",
  authenticateToken,
  authorize(["admin", "instructor"]),
  upload.single("file"),
  createContent
);

/* ================= UPDATE ================= */
router.put(
  "/:id",
  authenticateToken,
  authorize(["admin", "instructor"]),
  updateContent
);

/* ================= DELETE ================= */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  deleteContent
);

export default router;