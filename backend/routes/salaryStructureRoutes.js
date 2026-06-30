import express from "express";

import {
  createSalaryStructure,
  getAllSalaryStructures,
  getSalaryStructureByEmployee,
  updateSalaryStructure,
  deleteSalaryStructure,
} from "../controllers/salaryStructureController.js";

import { protect } from "../middleware/authMiddleware.js";
// If you already have authorizeRoles middleware, import it too.
// import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Salary Structure
router.post(
  "/",
  protect,
  // authorizeRoles("Admin", "HR"),
  createSalaryStructure
);

// Get All Salary Structures
router.get(
  "/",
  protect,
  // authorizeRoles("Admin", "HR"),
  getAllSalaryStructures
);

// Get Salary Structure By Employee
router.get(
  "/employee/:employeeId",
  protect,
  // authorizeRoles("Admin", "HR"),
  getSalaryStructureByEmployee
);

// Update Salary Structure
router.put(
  "/:id",
  protect,
  // authorizeRoles("Admin", "HR"),
  updateSalaryStructure
);

// Delete Salary Structure
router.delete(
  "/:id",
  protect,
  // authorizeRoles("Admin"),
  deleteSalaryStructure
);

export default router;