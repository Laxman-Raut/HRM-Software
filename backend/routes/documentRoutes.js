import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  getAllDocuments,
  verifyDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import upload from "../middleware/uploadDocument.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Employee uploads document
router.post(
  "/upload",
  protect,
  authorize("Employee"),
  upload.single("document"),
  uploadDocument
);

// Employee views own documents
router.get(
  "/my",
  protect,
  authorize("Employee"),
  getMyDocuments
);

// Admin / HR views all documents
router.get(
  "/",
  protect,
  authorize("Admin", "HR"),
  getAllDocuments
);

// Admin / HR verifies document
router.put(
  "/:id/verify",
  protect,
  authorize("Admin", "HR"),
  verifyDocument
);

// Delete document (Employee revoke or Admin/HR delete)
router.delete(
  "/:id",
  protect,
  deleteDocument
);

export default router;