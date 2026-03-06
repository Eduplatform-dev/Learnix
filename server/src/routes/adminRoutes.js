import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";
import Setting from "../models/Setting.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

const requireAdmin = [authenticateToken, authorize(["admin"])];

const defaultSettings = {
  general: {
    platformName: "Learnix",
    supportEmail: "",
    logoUrl: "",
  },
  notifications: {
    emailUpdates: true,
    productUpdates: false,
    billingAlerts: true,
  },
  security: {
    enforceTwoFactor: false,
    allowGoogleLogin: true,
    sessionTimeout: "30",
  },
  localization: {
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  },
  emailConfig: {
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    fromName: "",
    fromEmail: "",
    footer: "",
  },
  backup: {
    autoBackup: true,
    retentionDays: "30",
    backupWindow: "02:00-04:00",
  },
};

const monthLabel = (d) =>
  d.toLocaleString("en-US", { month: "short" });

const lastNMonths = (n) => {
  const now = new Date();
  const months = [];

  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthLabel(d));
  }

  return months;
};

/* ============================
   ADMIN STATS
   GET /api/admin/stats
============================ */
router.get(
  "/stats",
  ...requireAdmin,
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

/* ============================
   ADMIN DASHBOARD
   GET /api/admin/dashboard
============================ */
router.get("/dashboard", ...requireAdmin, async (_req, res) => {
  try {
    const students = await User.countDocuments({ role: "student" });
    const courses = await Course.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const submittedAssignments = await Assignment.countDocuments({
      status: "Submitted",
    });

    const completionRate =
      totalAssignments === 0
        ? 0
        : Math.round((submittedAssignments / totalAssignments) * 100);

    const months = lastNMonths(6);
    const base = students === 0 ? 0 : Math.max(0, students - 50);
    const step =
      students <= base ? 0 : Math.ceil((students - base) / (months.length - 1));

    const enrollmentData = months.map((m, idx) => ({
      month: m,
      students: Math.max(0, base + step * idx),
    }));

    res.json({
      stats: {
        students,
        courses,
        revenue: 0,
        completionRate,
      },
      enrollmentData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   ADMIN ANALYTICS
   GET /api/admin/analytics
============================ */
router.get("/analytics", ...requireAdmin, async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const totalContent = await Content.countDocuments();

    const months = lastNMonths(6);
    const base = totalUsers === 0 ? 0 : Math.max(0, totalUsers - 20);
    const step =
      totalUsers <= base ? 0 : Math.ceil((totalUsers - base) / (months.length - 1));

    const monthlyGrowth = months.map((m, idx) => ({
      month: m,
      users: Math.max(0, base + step * idx),
    }));

    const userEngagement = [
      { day: "Mon", active: Math.max(0, Math.floor(totalUsers * 0.2)) },
      { day: "Tue", active: Math.max(0, Math.floor(totalUsers * 0.25)) },
      { day: "Wed", active: Math.max(0, Math.floor(totalUsers * 0.18)) },
      { day: "Thu", active: Math.max(0, Math.floor(totalUsers * 0.3)) },
      { day: "Fri", active: Math.max(0, Math.floor(totalUsers * 0.22)) },
      { day: "Sat", active: Math.max(0, Math.floor(totalUsers * 0.15)) },
      { day: "Sun", active: Math.max(0, Math.floor(totalUsers * 0.1)) },
    ];

    const kpiMetrics = [
      { label: "Total Users", value: totalUsers },
      { label: "Students", value: totalStudents },
      { label: "Courses", value: totalCourses },
      { label: "Content Items", value: totalContent },
    ];

    res.json({
      monthlyGrowth,
      userEngagement,
      courseRatings: [],
      trafficSources: [],
      completionRates: [],
      kpiMetrics,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   ADMIN FEES STATS
   GET /api/admin/fees
============================ */
router.get("/fees", ...requireAdmin, async (_req, res) => {
  try {
    const paidStudents = await User.countDocuments({ role: "student" });

    res.json({
      totalRevenue: 0,
      pendingPayments: 0,
      paidStudents,
      growthRate: 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   SETTINGS
   GET /api/admin/settings
============================ */
router.get("/settings", ...requireAdmin, async (_req, res) => {
  try {
    const settings = await Setting.findOne().sort({ createdAt: -1 });

    res.json(settings ? settings.toObject() : defaultSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   SAVE SETTINGS
   POST /api/admin/settings
============================ */
router.post("/settings", ...requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};

    const upserted = await Setting.findOneAndUpdate(
      {},
      {
        ...defaultSettings,
        ...payload,
      },
      { new: true, upsert: true }
    );

    res.json(upserted.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
