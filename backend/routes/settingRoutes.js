import express from "express";
import { getSettings, updateSettings, getMyPermissions } from "../controllers/settingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Any authenticated user can check their role-based permissions
router.get("/my-permissions", protect, getMyPermissions);

// Only Admin role can access or update general settings
router.route("/")
  .get(protect, authorize("Admin"), getSettings)
  .put(protect, authorize("Admin"), updateSettings);

export default router;
