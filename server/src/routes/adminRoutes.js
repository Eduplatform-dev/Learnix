import express from "express";

import {
getAdminStats,
getDashboard,
getAnalytics,
getFeesStats,
getSettings,
saveSettings
} from "../controllers/adminController.js";

import {
authenticateToken,
authorize
} from "../middleware/auth.js";

const router = express.Router();

const requireAdmin = [
authenticateToken,
authorize(["admin"])
];

router.get("/stats", ...requireAdmin, getAdminStats);

router.get("/dashboard", ...requireAdmin, getDashboard);

router.get("/analytics", ...requireAdmin, getAnalytics);

router.get("/fees", ...requireAdmin, getFeesStats);

router.get("/settings", ...requireAdmin, getSettings);

router.post("/settings", ...requireAdmin, saveSettings);

export default router;