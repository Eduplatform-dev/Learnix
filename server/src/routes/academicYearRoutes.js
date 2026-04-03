import express from "express";
import {
  getAcademicYears,
  getCurrentAcademicYear,
  getAcademicYearById,
  createAcademicYear,
  updateAcademicYear,
  setCurrentAcademicYear,
  setActiveSemester,
  deleteAcademicYear,
} from "../controllers/academicYearController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* Any authenticated user can read — needed for dropdowns */
router.get("/",          authenticateToken, getAcademicYears);
router.get("/current",   authenticateToken, getCurrentAcademicYear);
router.get("/:id",       authenticateToken, getAcademicYearById);

/* Admin only — write operations */
router.post(  "/",                               authenticateToken, authorize(["admin"]), createAcademicYear);
router.put(   "/:id",                            authenticateToken, authorize(["admin"]), updateAcademicYear);
router.patch( "/:id/set-current",                authenticateToken, authorize(["admin"]), setCurrentAcademicYear);
router.patch( "/:yearId/semesters/:semesterId/set-active",
                                                 authenticateToken, authorize(["admin"]), setActiveSemester);
router.delete("/:id",                            authenticateToken, authorize(["admin"]), deleteAcademicYear);

export default router;
