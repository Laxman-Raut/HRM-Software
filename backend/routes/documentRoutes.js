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
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Employee uploads document (all authenticated users)
router.post(
  "/upload",
  protect,
  upload.single("document"),
  uploadDocument
);

// Employee views own documents (all authenticated users)
router.get(
  "/my",
  protect,
  getMyDocuments
);

// Admin / HR views all documents
router.get(
  "/",
  protect,
  checkPermission("canViewDocuments"),
  getAllDocuments
);

// Admin / HR verifies document
router.put(
  "/:id/verify",
  protect,
  checkPermission("canViewDocuments"),
  verifyDocument
);

// Delete document (Employee revoke or Admin/HR delete)
router.delete(
  "/:id",
  protect,
  deleteDocument
);

export default router;