import express from "express";

import {
  generatePayroll,
  getAllPayrolls,
  getEmployeePayrolls,
  updatePayrollStatus,
  deletePayroll,
} from "../controllers/payrollController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post(
  "/generate",
  protect,
  generatePayroll
);

// Get All Payrolls (Admin/HR)
router.get(
  "/",
  protect,
  getAllPayrolls
);

// Get Payrolls for a specific employee
router.get(
  "/employee/:employeeId",
  protect,
  getEmployeePayrolls
);

// Update Payroll Status
router.put(
  "/:id",
  protect,
  updatePayrollStatus
);

// Delete/Revert Payroll Record
router.delete(
  "/:id",
  protect,
  deletePayroll
);

export default router;