import express from "express";
import { register, login, refresh, logout, logoutAll } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login",    login);

// Uses only the httpOnly cookie — no auth middleware needed
router.post("/refresh",  refresh);

// Logout requires a valid access token so we know *who* is logging out
// for the audit log. The cookie is cleared regardless.
router.post("/logout",     authenticateToken, logout);
router.post("/logout-all", authenticateToken, logoutAll);

export default router;