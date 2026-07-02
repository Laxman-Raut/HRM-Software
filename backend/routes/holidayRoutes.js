import express from "express";
import {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Get All Holidays (All authenticated users)
router.get(
  "/",
  protect,
  getAllHolidays
);

// Get Holiday By ID (All authenticated users)
router.get(
  "/:id",
  protect,
  getHolidayById
);

// Create Holiday
router.post(
  "/",
  protect,
  checkPermission("canManageHolidays"),
  createHoliday
);

// Update Holiday
router.put(
  "/:id",
  protect,
  checkPermission("canManageHolidays"),
  updateHoliday
);

// Delete Holiday
router.delete(
  "/:id",
  protect,
  checkPermission("canManageHolidays"),
  deleteHoliday
);

export default router;