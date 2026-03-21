import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";
import Setting from "../models/Setting.js";
import Submission from "../models/Submission.js";

const defaultSettings = {
  general: { platformName: "Learnix", supportEmail: "", logoUrl: "" },
  notifications: { emailUpdates: true, productUpdates: false, billingAlerts: true },
  security: { enforceTwoFactor: false, allowGoogleLogin: true, sessionTimeout: "30" },
  localization: { language: "en", timezone: "UTC", dateFormat: "MM/DD/YYYY" },
  emailConfig: { smtpHost: "", smtpPort: "587", smtpUser: "", fromName: "", fromEmail: "", footer: "" },
  backup: { autoBackup: true, retentionDays: "30", backupWindow: "02:00-04:00" },
};

const lastNMonths = (n) => {
  const now = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("en-US", { month: "short" }), date: d });
  }
  return months;
};

/* ================= ADMIN STATS ================= */

export const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalAssignments, totalSubmissions] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
    ]);

    res.json({ totalStudents, totalCourses, totalAssignments, totalSubmissions, revenue: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DASHBOARD ================= */

export const getDashboard = async (req, res) => {
  try {
    const [students, courses, totalAssignments, submittedAssignments] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments({ status: { $in: ["submitted", "graded"] } }),
    ]);

    const completionRate =
      totalAssignments === 0 ? 0 : Math.round((submittedAssignments / totalAssignments) * 100);

    const months = lastNMonths(6);

    // Real enrollment data per month
    const enrollmentData = await Promise.all(
      months.map(async ({ label, date }) => {
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const count = await User.countDocuments({
          role: "student",
          createdAt: { $gte: date, $lt: nextMonth },
        });
        return { month: label, students: count };
      })
    );

    res.json({ stats: { students, courses, revenue: 0, completionRate }, enrollmentData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= ANALYTICS ================= */

export const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalCourses, totalContent, totalSubmissions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Content.countDocuments(),
      Submission.countDocuments(),
    ]);

    const months = lastNMonths(6);

    const monthlyGrowth = await Promise.all(
      months.map(async ({ label, date }) => {
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const users = await User.countDocuments({ createdAt: { $gte: date, $lt: nextMonth } });
        return { month: label, users };
      })
    );

    // Submissions per day for last 7 days (user engagement)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const userEngagement = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(start.getTime() + 86400000);
        const active = await Submission.countDocuments({ createdAt: { $gte: start, $lt: end } });
        return { day: days[start.getDay()], active };
      })
    );

    // Course ratings
    const courses = await Course.find({}, "title rating enrolledStudents").lean();
    const courseRatings = courses.map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 18) + "…" : c.title,
      rating: c.rating || 4.5,
      students: c.enrolledStudents?.length || 0,
    }));

    // Submission status distribution
    const [drafted, submitted, graded] = await Promise.all([
      Submission.countDocuments({ status: "draft" }),
      Submission.countDocuments({ status: "submitted" }),
      Submission.countDocuments({ status: "graded" }),
    ]);

    const completionRates = [
      { name: "Draft", value: drafted },
      { name: "Submitted", value: submitted },
      { name: "Graded", value: graded },
    ];

    res.json({
      monthlyGrowth,
      userEngagement,
      courseRatings,
      completionRates,
      trafficSources: [
        { source: "Direct", visits: Math.floor(totalUsers * 0.4) },
        { source: "Search", visits: Math.floor(totalUsers * 0.35) },
        { source: "Referral", visits: Math.floor(totalUsers * 0.25) },
      ],
      kpiMetrics: [
        { label: "Total Users", value: totalUsers },
        { label: "Students", value: totalStudents },
        { label: "Courses", value: totalCourses },
        { label: "Submissions", value: totalSubmissions },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= FEES ================= */

export const getFeesStats = async (req, res) => {
  try {
    const paidStudents = await User.countDocuments({ role: "student" });
    res.json({ totalRevenue: 0, pendingPayments: 0, paidStudents, growthRate: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET SETTINGS ================= */

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ createdAt: -1 });
    res.json(settings ? settings : defaultSettings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= SAVE SETTINGS ================= */

export const saveSettings = async (req, res) => {
  try {
    const payload = req.body || {};
    const updated = await Setting.findOneAndUpdate(
      {},
      { ...defaultSettings, ...payload },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
