import express from "express";
import { authenticateToken, authorize } from "../middleware/auth.js";
import {
  getMyFees,
  getAllFees,
  createFee,
  markAsPaid,
  deleteFee,
} from "../controllers/feeController.js";

const router = express.Router();

// Student: get their own fees
router.get("/my", authenticateToken, getMyFees);

// Admin: get all fees
router.get("/", authenticateToken, authorize(["admin"]), getAllFees);

// Admin: create a fee for a student
router.post("/", authenticateToken, authorize(["admin"]), createFee);

// Student/Admin: mark as paid
router.patch("/:id/pay", authenticateToken, markAsPaid);

// Admin: delete
router.delete("/:id", authenticateToken, authorize(["admin"]), deleteFee);

export default router;
