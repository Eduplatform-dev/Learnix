import express from "express";

import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignmentController.js";

import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* GET /api/assignments
   Query params: ?course=id  ?status=In+Progress  ?page=1  ?limit=50 */
router.get("/", authenticateToken, getAssignments);

/* GET /api/assignments/:id */
router.get("/:id", authenticateToken, getAssignmentById);

/* POST /api/assignments  — admin or instructor only */
router.post(
  "/",
  authenticateToken,
  authorize(["admin", "instructor"]),
  createAssignment
);

/* PUT /api/assignments/:id  — admin or instructor only */
router.put(
  "/:id",
  authenticateToken,
  authorize(["admin", "instructor"]),
  updateAssignment
);

/* DELETE /api/assignments/:id  — admin only */
router.delete(
  "/:id",
  authenticateToken,
  authorize(["admin"]),
  deleteAssignment
);

export default router;
