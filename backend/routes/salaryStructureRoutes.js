import express from "express";

import {
  createSalaryStructure,
  getAllSalaryStructures,
  getSalaryStructureByEmployee,
  updateSalaryStructure,
  deleteSalaryStructure,
} from "../controllers/salaryStructureController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createSalaryStructure
);

router.get(
  "/",
  protect,
  getAllSalaryStructures
);

router.get(
  "/employee/:employeeId",
  protect,
  getSalaryStructureByEmployee
);

router.put(
  "/:id",
  protect,
  updateSalaryStructure
);

router.delete(
  "/:id",
  protect,
  deleteSalaryStructure
);

export default router;