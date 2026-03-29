import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
} from "../controllers/courseController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/",              authenticateToken,                                   getCourses);
router.get("/:id",           authenticateToken,                                   getCourseById);
router.post("/",             authenticateToken, authorize(["admin", "instructor"]), createCourse);
router.put("/:id",           authenticateToken, authorize(["admin", "instructor"]), updateCourse);
router.delete("/:id",        authenticateToken, authorize(["admin", "instructor"]), deleteCourse);
router.post("/:id/enroll",   authenticateToken,                                   enrollCourse);
router.delete("/:id/enroll", authenticateToken,                                   unenrollCourse);

export default router;