import express from "express";

const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

import {
  createPromotion,
  getPromotions,
  getEmployeePromotions,
  deletePromotion,
} from "../controllers/promotionController.js";

// Admin & HR
router.post("/:employeeId", protect, checkPermission("canManageEmployees"), createPromotion);

// Admin & HR
router.get("/", protect, checkPermission("canManageEmployees"), getPromotions);

// Employee Promotion History
router.get(
  "/employee/:employeeId",
  protect,
  getEmployeePromotions
);

// Admin
router.delete(
  "/:id",
  protect,
  checkPermission("canManageEmployees"),
  deletePromotion
);
export default router;