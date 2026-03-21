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

router.get("/", authenticateToken, getContent);
router.get("/course/:courseId", authenticateToken, getCourseContent);
router.get("/:id", authenticateToken, getContentById);

router.post(
  "/",
  authenticateToken,
  authorize(["admin", "instructor"]),
  upload.single("file"),
  createContent
);

router.put(
  "/:id",
  authenticateToken,
  authorize(["admin", "instructor"]),
  updateContent
);

router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  deleteContent
);

export default router;
