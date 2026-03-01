import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// 🔐 Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Fetch fresh user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // contains role safely
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// 🔐 Role Authorization Middleware (RBAC)
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
};