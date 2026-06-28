import express from "express";
import { applyLeave, getLeaves, updateLeaveStatus } from "../controllers/leaveController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply Leave
router.post("/", protect, applyLeave);

// Get Leaves (role-based)
router.get("/", protect, getLeaves);

// Update Leave Status (Approve/Reject)
router.put("/:id", protect, updateLeaveStatus);

export default router;