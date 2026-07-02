import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create Employee — upload.single parses multipart/form-data so req.file and req.body are populated
router.post(
  "/",
  protect,
  checkPermission("canManageEmployees"),
  upload.single("profilePhoto"),
  createEmployee
);

// Get All Employees
router.get(
  "/",
  protect,
  checkPermission("canViewEmployees"),
  getAllEmployees
);

// Get Employee By ID
router.get(
  "/:id",
  protect,
  checkPermission("canViewEmployees"),
  getEmployeeById
);

// Update Employee — upload.single parses multipart/form-data for profile photo updates
router.put(
  "/:id",
  protect,
  checkPermission("canManageEmployees"),
  upload.single("profilePhoto"),
  updateEmployee
);

// Delete Employee
router.delete(
  "/:id",
  protect,
  checkPermission("canManageEmployees"),
  deleteEmployee
);
export default router;