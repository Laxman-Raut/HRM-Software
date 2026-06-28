import express from "express";
import {
  createWarning,
  getWarnings,
  updateWarningStatus,
  deleteWarning
} from "../controllers/WarningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createWarning);
router.get("/", protect, getWarnings);
router.put("/:id", protect, updateWarningStatus);
router.delete("/:id", protect, deleteWarning);

export default router;