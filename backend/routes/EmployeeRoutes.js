import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { authorize } from "../middleware/roleMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create Employee — upload.single parses multipart/form-data so req.file and req.body are populated
router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  upload.single("profilePhoto"),
  createEmployee
);

// Get All Employees
router.get(
  "/",
  protect,
  authorize("Admin", "HR"),
  getAllEmployees
);

// Get Employee By ID
router.get(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  getEmployeeById
);

// Update Employee — upload.single parses multipart/form-data for profile photo updates
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  upload.single("profilePhoto"),
  updateEmployee
);

// Delete Employee
router.delete(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  deleteEmployee
);
export default router;