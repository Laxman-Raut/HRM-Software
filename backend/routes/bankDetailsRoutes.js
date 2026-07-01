import express from "express";

import {
  createBankDetails,
  getMyBankDetails,
  updateBankDetails,
  getAllBankDetails,
  verifyBankDetails,
    rejectBankDetails,

} from "../controllers/bankDetailsController.js";

import { protect } from "../middleware/authMiddleware.js";
// import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
Employee Routes

*/

// Add Bank Details
router.post(
  "/",
  protect,
  createBankDetails
);

// Get My Bank Details
router.get(
  "/my",
  protect,
  getMyBankDetails
);

// Update My Bank Details
router.put(
  "/my",
  protect,
  updateBankDetails
);

/*
HR / Admin Routes
*/

// Get All Employees Bank Details
router.get(
  "/",
  protect,
  // authorizeRoles("Admin", "HR"),
  getAllBankDetails
);

router.put(
  "/verify/:id",
  protect,
  
  verifyBankDetails
);
router.put(
  "/reject/:id",
  protect,
  // authorizeRoles("Admin", "HR"),
  rejectBankDetails
);
export default router;