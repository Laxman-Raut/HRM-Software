import express from "express";

import {
  generatePayroll,
} from "../controllers/payrollController.js";

import { protect } from "../middleware/authMiddleware.js";
// import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post(
  "/generate",
  protect,
  // authorizeRoles("Admin", "HR"),
  generatePayroll
);

export default router;