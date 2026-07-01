import express from "express";

import {
  generatePayroll,
  getAllPayrolls,
  getEmployeePayrolls,
  updatePayrollStatus,
  deletePayroll,
} from "../controllers/payrollController.js";

import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Generate Payroll
router.post(
  "/generate",
  protect,
  checkPermission("canManagePayroll"),
  generatePayroll
);

// Get All Payrolls (Admin/HR)
router.get(
  "/",
  protect,
  checkPermission("canManagePayroll"),
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
  checkPermission("canManagePayroll"),
  updatePayrollStatus
);

// Delete/Revert Payroll Record
router.delete(
  "/:id",
  protect,
  checkPermission("canManagePayroll"),
  deletePayroll
);

export default router;