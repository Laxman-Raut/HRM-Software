import express from "express";
import {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get All Holidays (Admin, HR, Employee)
router.get(
  "/",
  protect,
  authorize("Admin", "HR", "Employee"),
  getAllHolidays
);

// Get Holiday By ID (Admin, HR, Employee)
router.get(
  "/:id",
  protect,
  authorize("Admin", "HR", "Employee"),
  getHolidayById
);

// Create Holiday (Admin, HR)
router.post(
  "/",
  protect,
  authorize("Admin", "HR"),
  createHoliday
);

// Update Holiday (Admin, HR)
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateHoliday
);

// Delete Holiday (Admin, HR)
router.delete(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  deleteHoliday
);

export default router;