import express from "express";

import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse
} from "../controllers/courseController.js";

import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* ================= COURSES ================= */

router.get(
"/",
authenticateToken,
getCourses
);

router.get(
"/:id",
authenticateToken,
getCourseById
);

router.post(
"/",
authenticateToken,
authorize(["admin"]),
createCourse
);

router.put(
"/:id",
authenticateToken,
authorize(["admin"]),
updateCourse
);

router.delete(
"/:id",
authenticateToken,
authorize(["admin"]),
deleteCourse
);

router.post(
  "/:id/enroll",
  authenticateToken,
  enrollCourse
);

export default router;