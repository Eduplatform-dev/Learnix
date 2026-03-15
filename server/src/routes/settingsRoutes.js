import express from "express";
import Setting from "../models/Setting.js";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

/* GET SETTINGS */

router.get(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (_req, res) => {
    try {
      let settings = await Setting.findOne();

      if (!settings) {
        settings = await Setting.create({});
      }

      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* UPDATE SETTINGS */

router.put(
  "/",
  authenticateToken,
  authorize(["admin"]),
  async (req, res) => {
    try {
      let settings = await Setting.findOne();

      if (!settings) {
        settings = await Setting.create({});
      }

      Object.assign(settings, req.body);

      await settings.save();

      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;