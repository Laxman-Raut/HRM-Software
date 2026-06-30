import express from "express";
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get announcements
router.get("/", protect, getAnnouncements);

// Create Announcement (Admin & HR)
router.post("/", protect, authorize("Admin", "HR"), createAnnouncement);

// Delete Announcement (Admin & HR)
router.delete("/:id", protect, authorize("Admin", "HR"), deleteAnnouncement);

export default router;