import express from "express";
import {
  createWarning,
  getWarnings,
  updateWarningStatus,
  deleteWarning
} from "../controllers/WarningController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post("/", protect, checkPermission("canIssueWarnings"), createWarning);
router.get("/", protect, getWarnings);
router.put("/:id", protect, checkPermission("canIssueWarnings"), updateWarningStatus);
router.delete("/:id", protect, checkPermission("canIssueWarnings"), deleteWarning);

export default router;