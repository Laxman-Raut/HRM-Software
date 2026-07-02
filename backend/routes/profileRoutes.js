import express from "express";
const router = express.Router();
import {
  createProfile,
  getMyProfile,
  updateProfile,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

router.post("/", protect, createProfile);

router.get("/me", protect, getMyProfile);

router.put("/", protect, updateProfile);

export default router;