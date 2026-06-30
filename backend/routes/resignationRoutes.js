import express from "express";

import {
  createResignation,
  getAllResignations,
  getMyResignation,
  updateResignationStatus,
  deleteResignation,
} from "../controllers/resignationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

/*
====================================================
Employee Routes
====================================================
*/

// Employee submits resignation
router.post(
  "/",
  protect,
  authorize("Employee"),
  createResignation
);

// Employee views own resignation
router.get(
  "/my",
  protect,
  authorize("Employee"),
  getMyResignation
);

/*
====================================================
Admin / HR Routes
====================================================
*/

// View all resignations
router.get(
  "/",
  protect,
  authorize("Admin", "HR"),
  getAllResignations
);

// Approve / Reject resignation
router.put(
  "/:id",
  protect,
  authorize("Admin", "HR"),
  updateResignationStatus
);

// Employee revokes resignation OR Admin/HR deletes resignation
router.delete(
  "/:id",
  protect,
  deleteResignation
);

export default router;