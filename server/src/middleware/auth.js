import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

/* ================= AUTHENTICATE ================= */

export const authenticateToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(403).json({ error: "Invalid token" });

  }
};

/* ================= AUTHORIZE ROLES ================= */

export const authorize = (roles = []) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();

  };

};