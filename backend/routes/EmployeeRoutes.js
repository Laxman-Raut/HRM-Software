import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Create Employee (with profile photo upload)
router.post(
  "/",
  protect,
  upload.single("profilePhoto"),
  createEmployee
);

// Get All Employees
router.get("/", protect, getAllEmployees);

// Get Employee By ID
router.get("/:id", protect, getEmployeeById);

// Update Employee (with optional profile photo upload)
router.put(
  "/:id",
  protect,
  upload.single("profilePhoto"),
  updateEmployee
);

// Delete Employee
router.delete("/:id", protect, deleteEmployee);

export default router;