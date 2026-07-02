import express from "express";

import {
  createResignation,
  getAllResignations,
  getMyResignation,
  updateResignationStatus,
  deleteResignation,
} from "../controllers/resignationController.js";

import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

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
  createResignation
);

// Employee views own resignation
router.get(
  "/my",
  protect,
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
  checkPermission("canManageResignations"),
  getAllResignations
);

// Approve / Reject resignation
router.put(
  "/:id",
  protect,
  checkPermission("canManageResignations"),
  updateResignationStatus
);

// Employee revokes resignation OR Admin/HR deletes resignation
router.delete(
  "/:id",
  protect,
  deleteResignation
);

export default router;