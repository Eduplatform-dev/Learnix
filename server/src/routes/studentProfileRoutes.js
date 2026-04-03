import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
  getAllProfiles,
  verifyProfile,
  adminUpdateProfile,
} from "../controllers/studentProfileController.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* ── Student: own profile ────────────────────────────────── */
router.get(  "/me",     authenticateToken, getMyProfile);
router.put(  "/me",     authenticateToken, updateMyProfile);

/* ── Admin: all profiles ─────────────────────────────────── */
router.get(  "/",       authenticateToken, authorize(["admin"]), getAllProfiles);

/* ── Admin / Instructor: view a specific student's profile ── */
router.get(  "/user/:userId", authenticateToken, authorize(["admin", "instructor"]), getProfileByUserId);

/* ── Admin: verify or update a student's profile ─────────── */
router.patch("/user/:userId/verify",
             authenticateToken, authorize(["admin"]), verifyProfile);
router.put(  "/user/:userId",
             authenticateToken, authorize(["admin"]), adminUpdateProfile);

export default router;
