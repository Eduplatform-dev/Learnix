import User from "../models/User.js";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
import Content from "../models/Content.js";
import Setting from "../models/Setting.js";
import Submission from "../models/Submission.js";
import Fee from "../models/Fee.js";

/* ─── HELPERS ─────────────────────────────────────────── */
const defaultSettings = {
  general:      { platformName: "Learnix", supportEmail: "", logoUrl: "" },
  notifications:{ emailUpdates: true, productUpdates: false, billingAlerts: true },
  security:     { enforceTwoFactor: false, allowGoogleLogin: true, sessionTimeout: "30" },
  localization: { language: "en", timezone: "UTC", dateFormat: "MM/DD/YYYY" },
  emailConfig:  { smtpHost: "", smtpPort: "587", smtpUser: "", fromName: "", fromEmail: "", footer: "" },
  backup:       { autoBackup: true, retentionDays: "30", backupWindow: "02:00-04:00" },
};

const lastNMonths = (n) => {
  const now    = new Date();
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString("en-US", { month: "short" }),
      date:  d,
      next:  new Date(d.getFullYear(), d.getMonth() + 1, 1),
    });
  }
  return months;
};

/* ─── ADMIN STATS ─────────────────────────────────────── */
export const getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalAssignments, totalSubmissions, paidFees] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Course.countDocuments(),
        Assignment.countDocuments(),
        Submission.countDocuments(),
        Fee.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const revenue = paidFees[0]?.total ?? 0;

    res.json({ totalStudents, totalCourses, totalAssignments, totalSubmissions, revenue });
  } catch (err) {
    console.error("getAdminStats error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─── DASHBOARD ───────────────────────────────────────── */
export const getDashboard = async (req, res) => {
  try {
    const [students, courses, totalAssignments, submittedAssignments, revenueResult] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Course.countDocuments(),
        Submission.countDocuments(),
        Submission.countDocuments({ status: { $in: ["submitted", "graded"] } }),
        Fee.aggregate([
          { $match: { status: "paid" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    const revenue        = revenueResult[0]?.total ?? 0;
    const completionRate = totalAssignments === 0
      ? 0
      : Math.round((submittedAssignments / totalAssignments) * 100);

    const months = lastNMonths(6);

    const enrollmentData = await Promise.all(
      months.map(async ({ label, date, next }) => {
        const count = await User.countDocuments({
          role:      "student",
          createdAt: { $gte: date, $lt: next },
        });
        return { month: label, students: count };
      })
    );

    res.json({
      stats: { students, courses, revenue, completionRate },
      enrollmentData,
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─── ANALYTICS ───────────────────────────────────────── */
export const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCourses,
      totalContent,
      totalSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Content.countDocuments(),
      Submission.countDocuments(),
    ]);

    const months = lastNMonths(6);

    // Monthly new user growth
    const monthlyGrowth = await Promise.all(
      months.map(async ({ label, date, next }) => {
        const users = await User.countDocuments({ createdAt: { $gte: date, $lt: next } });
        return { month: label, users };
      })
    );

    // Daily submission activity (last 7 days)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const userEngagement = await Promise.all(
      Array.from({ length: 7 }, async (_, i) => {
        const d     = new Date();
        d.setDate(d.getDate() - (6 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end   = new Date(start.getTime() + 86_400_000);
        const active = await Submission.countDocuments({ createdAt: { $gte: start, $lt: end } });
        return { day: days[start.getDay()], active };
      })
    );

    // Course ratings
    const courses = await Course.find({}, "title rating enrolledStudents").lean();
    const courseRatings = courses.map((c) => ({
      name:     c.title.length > 20 ? c.title.slice(0, 18) + "…" : c.title,
      rating:   c.rating ?? 4.5,
      students: c.enrolledStudents?.length ?? 0,
    }));

    // Submission status distribution — only include non-zero slices
    const [drafted, submitted, graded] = await Promise.all([
      Submission.countDocuments({ status: "draft" }),
      Submission.countDocuments({ status: "submitted" }),
      Submission.countDocuments({ status: "graded" }),
    ]);

    const completionRates = [
      { name: "Draft",     value: drafted   },
      { name: "Submitted", value: submitted },
      { name: "Graded",    value: graded    },
    ].filter((d) => d.value > 0); // remove zero slices so pie chart renders

    // Traffic sources — derived from user counts since we have no analytics DB
    const trafficSources = [
      { source: "Direct",   visits: Math.floor(totalUsers * 0.40) },
      { source: "Search",   visits: Math.floor(totalUsers * 0.35) },
      { source: "Referral", visits: Math.floor(totalUsers * 0.25) },
    ];

    const kpiMetrics = [
      { label: "Total Users",   value: totalUsers },
      { label: "Students",      value: totalStudents },
      { label: "Courses",       value: totalCourses },
      { label: "Submissions",   value: totalSubmissions },
    ];

    res.json({
      monthlyGrowth,
      userEngagement,
      courseRatings,
      completionRates,
      trafficSources,
      kpiMetrics,
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─── FEES STATS ──────────────────────────────────────── */
export const getFeesStats = async (req, res) => {
  try {
    const [revenueResult, pendingResult, paidStudentCount] = await Promise.all([
      Fee.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Fee.aggregate([
        { $match: { status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Fee.distinct("student", { status: "paid" }),
    ]);

    res.json({
      totalRevenue:    revenueResult[0]?.total  ?? 0,
      pendingPayments: pendingResult[0]?.total  ?? 0,
      paidStudents:    paidStudentCount.length,
      growthRate:      0,
    });
  } catch (err) {
    console.error("getFeesStats error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─── GET SETTINGS ────────────────────────────────────── */
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne().sort({ createdAt: -1 });
    res.json(settings ?? defaultSettings);
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ─── SAVE SETTINGS ───────────────────────────────────── */
export const saveSettings = async (req, res) => {
  try {
    const payload = req.body ?? {};
    const updated = await Setting.findOneAndUpdate(
      {},
      { ...defaultSettings, ...payload },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("saveSettings error:", err);
    res.status(500).json({ error: err.message });
  }
};
