import express from "express";
import { getSettings, updateSettings, getMyPermissions } from "../controllers/settingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Any authenticated user can check their role-based permissions
router.get("/my-permissions", protect, getMyPermissions);

// Only roles with canManageSettings permission can access or update settings
router.route("/")
  .get(protect, checkPermission("canManageSettings"), getSettings)
  .put(protect, checkPermission("canManageSettings"), updateSettings);

export default router;
