import express from "express";
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getAttendanceHistory,
  getAttendanceStats,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/today-status", protect, getTodayStatus);
router.get("/history", protect, getAttendanceHistory);
router.get("/stats", protect, getAttendanceStats);

export default router;