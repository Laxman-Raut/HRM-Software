import BankDetails from "../models/BankDetails.js";
export const createBankDetails = async (req, res) => {
  try {
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      upiId,
    } = req.body;

    // Check if employee already added bank details
    const existing = await BankDetails.findOne({
      employee: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Bank details already exist. Please update instead.",
      });
    }

    const bankDetails = await BankDetails.create({
      employee: req.user._id,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      upiId,
    });

    res.status(201).json({
      success: true,
      message: "Bank details added successfully.",
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({
      employee: req.user._id,
    }).populate("employee", "employeeId firstName lastName email");

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({
      employee: req.user._id,
    });

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found.",
      });
    }

    // Prevent editing after verification
    if (bankDetails.status === "Verified") {
      return res.status(400).json({
        success: false,
        message: "Verified bank details cannot be updated.",
      });
    }

    Object.assign(bankDetails, req.body);

    // Reset verification after update
    bankDetails.status = "Pending";
    bankDetails.isVerified = false;
    bankDetails.verifiedBy = null;
    bankDetails.verifiedAt = null;

    await bankDetails.save();

    res.status(200).json({
      success: true,
      message: "Bank details updated successfully.",
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.find()
      .populate(
        "employee",
        "employeeId firstName lastName department designation"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bankDetails.length,
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findById(req.params.id);

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found.",
      });
    }

    bankDetails.status = "Verified";
    bankDetails.isVerified = true;
    bankDetails.verifiedBy = req.user._id;
    bankDetails.verifiedAt = new Date();

    await bankDetails.save();

    res.status(200).json({
      success: true,
      message: "Bank details verified successfully.",
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findById(req.params.id);

    if (!bankDetails) {
      return res.status(404).json({
        success: false,
        message: "Bank details not found.",
      });
    }

    bankDetails.status = "Rejected";
    bankDetails.isVerified = false;
    bankDetails.verifiedBy = req.user._id;
    bankDetails.verifiedAt = new Date();

    await bankDetails.save();

    res.status(200).json({
      success: true,
      message: "Bank details rejected successfully.",
      data: bankDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};