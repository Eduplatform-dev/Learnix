import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* ADMIN DASHBOARD STATS */
router.get(
  "/stats",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const totalStudents = await User.countDocuments({ role: "student" });
      const totalCourses = await Course.countDocuments();
      const totalAssignments = await Assignment.countDocuments();

      res.json({
        totalStudents,
        totalCourses,
        totalAssignments,
        revenue: 0, // later payment model
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;