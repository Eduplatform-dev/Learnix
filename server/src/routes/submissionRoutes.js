import express from "express";

import {
getSubmissions,
createSubmission,
gradeSubmission,
deleteSubmission
} from "../controllers/submissionController.js";

import {
authenticateToken,
authorize
} from "../middleware/auth.js";

const router = express.Router();

/* ================= GET SUBMISSIONS ================= */

router.get(
"/",
authenticateToken,
getSubmissions
);

/* ================= CREATE SUBMISSION ================= */

router.post(
"/",
authenticateToken,
createSubmission
);

/* ================= GRADE SUBMISSION ================= */

router.put(
"/:id/grade",
authenticateToken,
authorize(["admin", "instructor"]),
gradeSubmission
);

/* ================= DELETE SUBMISSION ================= */

router.delete(
"/:id",
authenticateToken,
authorize(["admin"]),
deleteSubmission
);

export default router;
