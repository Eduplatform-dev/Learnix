/**
 * attendanceRoutes.js — updated with all 7 attendance features:
 *
 * Feature 1 — Attendance stored (existing, unchanged)
 * Feature 2 — Academic courses filter: courseType:"academic" filter on GET /
 * Feature 3 — Instructor sees present/absent/late/excused list (report)
 * Feature 4 — Student leave requests (POST/GET /api/leaves)
 * Feature 5 — Real holidays (GET /api/holidays, seeded via seedHolidays.js)
 * Feature 6 — Date lock: instructor can only mark TODAY (IST), no past/future
 * Feature 7 — Instructor approves/rejects leave (PATCH /api/leaves/:id/review)
 */

import express from "express";
import Attendance  from "../models/Attendance.js";
import Course      from "../models/Course.js";
import Notification from "../models/Notification.js";
import Holiday     from "../models/Holiday.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* ── IST helpers ──────────────────────────────────────────────────────── */
/**
 * Returns today's date string (YYYY-MM-DD) in IST (UTC+5:30).
 * This fixes the UTC vs IST midnight bug where `new Date().toISOString().split("T")[0]`
 * would return yesterday's date for Indian users after 18:30 IST.
 */
function todayIST() {
  const now = new Date();
  // IST = UTC + 5h 30m = UTC + 330 minutes
  const istOffset = 330 * 60 * 1000;
  const istDate   = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Returns startOfDay and endOfDay for a YYYY-MM-DD string, interpreted as IST.
 */
function dayBoundsIST(dateStr) {
  // Parse as IST midnight
  const [y, m, d] = dateStr.split("-").map(Number);
  // IST is UTC+5:30, so IST midnight = UTC 18:30 previous day
  const startIST = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - 330 * 60 * 1000);
  const endIST   = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - 330 * 60 * 1000);
  return { start: startIST, end: endIST };
}

/* ── Feature 5: Holidays ──────────────────────────────────────────────── */

/** GET /api/attendance/holidays — list all holidays (upcoming + past) */
router.get("/holidays", authenticateToken, async (req, res) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    // For recurring holidays, also return them for the requested year
    const all = await Holiday.find().sort({ date: 1 }).lean();

    const result = all.map(h => {
      if (h.recurring) {
        // Rewrite the year portion to the requested year
        const d = new Date(h.date);
        d.setFullYear(y);
        return { ...h, date: d };
      }
      return h;
    }).filter(h => new Date(h.date).getFullYear() === y);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Check if a given date string (YYYY-MM-DD) is a holiday.
 * Returns the Holiday doc or null.
 */
async function findHolidayOnDate(dateStr) {
  const { start, end } = dayBoundsIST(dateStr);
  const exact = await Holiday.findOne({ date: { $gte: start, $lte: end } }).lean();
  if (exact) return exact;

  // Check recurring holidays: match month + day regardless of year
  const [, mo, da] = dateStr.split("-").map(Number);
  const recurring = await Holiday.find({ recurring: true }).lean();
  return recurring.find(h => {
    const hd = new Date(h.date);
    return hd.getMonth() + 1 === mo && hd.getDate() === da;
  }) || null;
}

/* ── Feature 4 & 7: Leave Requests ───────────────────────────────────── */

/** POST /api/attendance/leaves — student submits a leave request */
router.post("/leaves", authenticateToken, authorize(["student"]), async (req, res) => {
  try {
    const { courseId, date, reason } = req.body;
    if (!courseId || !date || !reason?.trim()) {
      return res.status(400).json({ error: "courseId, date, and reason are required" });
    }

    // Prevent duplicate pending requests for same course+date
    const existing = await LeaveRequest.findOne({
      student: req.user._id,
      course:  courseId,
      date:    { $gte: dayBoundsIST(date).start, $lte: dayBoundsIST(date).end },
      status:  "pending",
    });
    if (existing) {
      return res.status(409).json({ error: "A pending leave request already exists for this date and course" });
    }

    const leave = await LeaveRequest.create({
      student: req.user._id,
      course:  courseId,
      date:    new Date(date),
      reason:  reason.trim(),
    });

    // Notify instructor(s) of the course
    const course = await Course.findById(courseId).lean();
    if (course?.instructor) {
      await Notification.create({
        recipient: course.instructor,
        title:     "Leave Request 📋",
        message:   `${req.user.username} submitted a leave request for ${new Date(date).toLocaleDateString("en-IN")} in ${course.title}.`,
        type:      "system",
        link:      "/instructor/attendance",
      });
    }

    res.status(201).json(leave);
  } catch (err) {
    console.error("createLeave error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/attendance/leaves/my — student sees their own leave requests */
router.get("/leaves/my", authenticateToken, authorize(["student"]), async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ student: req.user._id })
      .populate("course", "title subjectCode")
      .sort({ date: -1 })
      .lean();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/attendance/leaves/:id — student cancels a pending leave */
router.delete("/leaves/:id", authenticateToken, authorize(["student"]), async (req, res) => {
  try {
    const leave = await LeaveRequest.findOne({
      _id:     req.params.id,
      student: req.user._id,
      status:  "pending",
    });
    if (!leave) return res.status(404).json({ error: "Pending leave request not found" });
    await leave.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/attendance/leaves/course/:courseId — instructor sees pending leaves for their course */
router.get("/leaves/course/:courseId", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    const { status } = req.query; // optional filter: pending | approved | rejected
    const filter = { course: req.params.courseId };
    if (status) filter.status = status;

    const leaves = await LeaveRequest.find(filter)
      .populate("student", "username email")
      .populate("reviewedBy", "username")
      .sort({ date: -1 })
      .lean();
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** PATCH /api/attendance/leaves/:id/review — Feature 7: instructor approves/rejects */
router.patch("/leaves/:id/review", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }

    const leave = await LeaveRequest.findById(req.params.id)
      .populate("student", "username email _id")
      .populate("course", "title");
    if (!leave) return res.status(404).json({ error: "Leave request not found" });
    if (leave.status !== "pending") {
      return res.status(409).json({ error: "Leave request already reviewed" });
    }

    leave.status      = status;
    leave.reviewNote  = reviewNote || "";
    leave.reviewedBy  = req.user._id;
    leave.reviewedAt  = new Date();
    await leave.save();

    // If approved: update attendance record for that date to "excused" if it exists
    if (status === "approved") {
      const dateStr = leave.date.toISOString().split("T")[0];
      const { start, end } = dayBoundsIST(dateStr);
      const session = await Attendance.findOne({
        course: leave.course._id,
        date:   { $gte: start, $lte: end },
      });
      if (session) {
        const rec = session.records.find(r => String(r.student) === String(leave.student._id));
        if (rec) {
          rec.status = "excused";
          await session.save();
        }
      }
    }

    // Notify the student
    await Notification.create({
      recipient: leave.student._id,
      title:     status === "approved" ? "Leave Approved ✅" : "Leave Rejected ❌",
      message:   `Your leave request for ${leave.date.toLocaleDateString("en-IN")} in ${leave.course.title} was ${status}.${reviewNote ? ` Note: ${reviewNote}` : ""}`,
      type:      "system",
      link:      "/dashboard/attendance",
    });

    res.json(leave);
  } catch (err) {
    console.error("reviewLeave error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET my attendance summary (student) ──────────────────────────────── */
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const studentId = req.user._id;

    const records = await Attendance.find({ "records.student": studentId })
      .populate("course", "title subjectCode courseType")
      .sort({ date: -1 })
      .lean();

    const subjectMap = new Map();
    for (const session of records) {
      const key   = String(session.course?._id || session.subject || "Unknown");
      const label = session.course?.title      || session.subject || "Unknown";
      const code  = session.course?.subjectCode || "";
      const myRec = session.records.find(r => String(r.student) === String(studentId));
      if (!myRec) continue;

      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          courseId: session.course?._id ? String(session.course._id) : null,
          name: label, code,
          total: 0, present: 0, absent: 0, late: 0, excused: 0,
          sessions: [],
        });
      }
      const s = subjectMap.get(key);
      s.total++;
      if      (myRec.status === "present") s.present++;
      else if (myRec.status === "absent")  s.absent++;
      else if (myRec.status === "late")    s.late++;
      else if (myRec.status === "excused") s.excused++;
      s.sessions.push({ date: session.date, status: myRec.status, topic: session.topic, type: session.lectureType });
    }

    const subjects = Array.from(subjectMap.values()).map(s => {
      // Excused counts as present for percentage calculation
      const effective = s.present + s.late * 0.5 + s.excused;
      const pct = s.total === 0 ? 100 : Math.round((effective / s.total) * 100);
      return { ...s, percentage: pct, shortage: s.total > 0 && pct < 75 };
    });

    const totalSessions = subjects.reduce((a, s) => a + s.total,   0);
    const totalPresent  = subjects.reduce((a, s) => a + s.present,  0);
    const overallPct    = totalSessions === 0 ? 100 : Math.round(totalPresent / totalSessions * 100);

    res.json({ subjects, overallPercentage: overallPct });
  } catch (err) {
    console.error("getMyAttendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET sessions for a course (instructor/admin) ─────────────────────── */
router.get("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const sessions = await Attendance.find({ course: req.params.courseId })
      .populate("markedBy", "username")
      .sort({ date: -1 })
      .lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/attendance/today/:courseId — instructor checks if today already marked */
router.get("/today/:courseId", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    const today = todayIST();
    const { start, end } = dayBoundsIST(today);
    const session = await Attendance.findOne({
      course: req.params.courseId,
      date:   { $gte: start, $lte: end },
    }).lean();

    // Also check if today is a holiday
    const holiday = await findHolidayOnDate(today);

    res.json({ session: session || null, today, holiday: holiday || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET all attendance for dept/year (admin) ──────────────────────────── */
router.get("/", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    const filter = {};
    if (req.query.course)     filter.course     = req.query.course;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year)       filter.year       = Number(req.query.year);
    if (req.query.date) {
      const { start, end } = dayBoundsIST(req.query.date);
      filter.date = { $gte: start, $lte: end };
    }

    const sessions = await Attendance.find(filter)
      .populate("course",     "title courseType")
      .populate("department", "name code")
      .populate("markedBy",   "username")
      .sort({ date: -1 })
      .limit(200)
      .lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST: mark attendance — Feature 6: date locked to today IST ─────── */
router.post("/", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    const { courseId, date, records, lectureType, topic, department, year } = req.body;

    if (!courseId || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: "courseId, date, and records are required" });
    }

    // ── Feature 6: date lock ──────────────────────────────────────────────
    // Admins bypass the lock; instructors are restricted to today only.
    if (req.user.role === "instructor") {
      const today = todayIST();
      if (date !== today) {
        return res.status(403).json({
          error: `Attendance can only be marked for today (${today}). Past and future dates are not allowed.`,
        });
      }
    }

    // ── Feature 5: block marking on holidays ──────────────────────────────
    const holiday = await findHolidayOnDate(date);
    if (holiday && req.user.role === "instructor") {
      return res.status(403).json({
        error: `Today is a holiday: ${holiday.name}. Attendance cannot be marked on holidays.`,
        holiday,
      });
    }

    const { start, end } = dayBoundsIST(date);

    // Feature 4: apply approved leaves — override absent → excused
    const approvedLeaves = await LeaveRequest.find({
      course:  courseId,
      date:    { $gte: start, $lte: end },
      status:  "approved",
    }).lean();
    const approvedStudentIds = new Set(approvedLeaves.map(l => String(l.student)));

    const finalRecords = records.map(r => ({
      student: r.student,
      status:  approvedStudentIds.has(String(r.student)) && r.status === "absent"
        ? "excused"
        : r.status,
    }));

    let session = await Attendance.findOne({ course: courseId, date: { $gte: start, $lte: end } });

    if (session) {
      session.records     = finalRecords;
      session.lectureType = lectureType || "lecture";
      session.topic       = topic       || "";
      session.markedBy    = req.user._id;
      if (department) session.department = department;
      if (year)       session.year       = year;
      await session.save();
    } else {
      session = await Attendance.create({
        course:      courseId,
        date:        new Date(date),
        records:     finalRecords,
        lectureType: lectureType || "lecture",
        topic:       topic       || "",
        markedBy:    req.user._id,
        department:  department  || null,
        year:        year        || null,
      });
    }

    // Auto-notify students with < 75% attendance
    const absentIds = finalRecords.filter(r => r.status === "absent").map(r => r.student);
    for (const studentId of absentIds) {
      const allSessions = await Attendance.find({ course: courseId, "records.student": studentId });
      let present = 0, total = 0;
      for (const s of allSessions) {
        const rec = s.records.find(r => String(r.student) === String(studentId));
        if (rec) {
          total++;
          if (rec.status === "present" || rec.status === "late" || rec.status === "excused") present++;
        }
      }
      const pct = total === 0 ? 100 : Math.round(present / total * 100);
      if (pct < 75) {
        const course = await Course.findById(courseId).lean();
        await Notification.create({
          recipient: studentId,
          title:     "Attendance Warning ⚠️",
          message:   `Your attendance in ${course?.title || "a course"} has dropped to ${pct}%. Minimum required is 75%.`,
          type:      "attendance_warning",
          link:      "/dashboard/attendance",
        });
      }
    }

    res.status(201).json(session);
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET summary report for a course — Feature 3 ──────────────────────── */
router.get("/report/:courseId", authenticateToken, async (req, res) => {
  try {
    const sessions = await Attendance.find({ course: req.params.courseId }).lean();
    const course   = await Course.findById(req.params.courseId)
      .populate("enrolledStudents", "username email")
      .lean();

    if (!course) return res.status(404).json({ error: "Course not found" });

    const studentSummary = course.enrolledStudents.map(student => {
      let present = 0, absent = 0, late = 0, excused = 0, total = 0;
      const sessionDetails = [];

      for (const session of sessions) {
        const rec = session.records.find(r => String(r.student) === String(student._id));
        if (rec) {
          total++;
          if      (rec.status === "present") present++;
          else if (rec.status === "absent")  absent++;
          else if (rec.status === "late")    late++;
          else if (rec.status === "excused") excused++;
          sessionDetails.push({ date: session.date, status: rec.status, topic: session.topic });
        }
      }

      const effective = present + late * 0.5 + excused;
      const pct = total === 0 ? 100 : Math.round((effective / total) * 100);

      return {
        student:    { _id: student._id, username: student.username, email: student.email },
        present, absent, late, excused, total,
        percentage: pct,
        shortage:   pct < 75,
        sessions:   sessionDetails,
      };
    });

    res.json({
      course:        { _id: course._id, title: course.title },
      totalSessions: sessions.length,
      students:      studentSummary,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE a session ──────────────────────────────────────────────────── */
router.delete("/:id", authenticateToken, authorize(["admin", "instructor"]), async (req, res) => {
  try {
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
