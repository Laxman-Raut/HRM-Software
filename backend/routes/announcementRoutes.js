import express from "express";
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Get announcements
router.get("/", protect, getAnnouncements);

// Create Announcement (Admin & HR)
router.post("/", protect, checkPermission("canCreateAnnouncements"), createAnnouncement);

// Delete Announcement (Admin & HR)
router.delete("/:id", protect, checkPermission("canCreateAnnouncements"), deleteAnnouncement);

export default router;