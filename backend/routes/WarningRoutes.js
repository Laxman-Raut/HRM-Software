import express from "express";
import {
  createWarning,
  getWarnings,
  updateWarningStatus,
  deleteWarning
} from "../controllers/WarningController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("Admin", "HR"), createWarning);
router.get("/", protect, getWarnings);
router.put("/:id", protect, authorize("Admin", "HR"), updateWarningStatus);
router.delete("/:id", protect, authorize("Admin", "HR"), deleteWarning);

export default router;