import { createWarningService } from "../services/warningService.js";
import Warning from "../models/Warning.js";
import { createNotification } from "../services/notificationService.js";

// Create Warning
export const createWarning = async (req, res) => {
  try {
    const warningData = {
      ...req.body,

      // Logged-in User Details
      issuedById: req.user._id,
      issuedByRole: req.user.role,
      issuedByName: req.user.name || req.user.firstName || "Admin",
    };

    const warning = await createWarningService(warningData);

    // 🔔 NOTIFY EMPLOYEE
    try {
      await createNotification({
        title: "Warning Issued",
        message: `A new warning has been issued: "${warning.title}"`,
        type: "ERROR",
        forRole: "Employee",
      });
    } catch (err) {
      console.error("Error creating notification for warning:", err);
    }

    res.status(201).json({
      success: true,
      message: "Warning issued successfully",
      data: warning,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Warnings (Filter by logged-in user if standard employee)
export const getWarnings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Employee") {
      query = { employee: req.user._id };
    }

    const warnings = await Warning.find(query)
      .populate("employee", "firstName lastName employeeId department email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: warnings.length,
      data: warnings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Warning Status (Active/Resolved) - Admin/HR only
export const updateWarningStatus = async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update warning status",
      });
    }

    const { status } = req.body;
    const warning = await Warning.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("employee", "firstName lastName employeeId department email");

    if (!warning) {
      return res.status(404).json({
        success: false,
        message: "Warning not found",
      });
    }

    // 🔔 NOTIFY EMPLOYEE
    try {
      await createNotification({
        title: "Warning Status Updated",
        message: `Your warning "${warning.title}" has been marked as ${status}`,
        type: status === "Resolved" ? "SUCCESS" : "WARNING",
        forRole: "Employee",
      });
    } catch (err) {
      console.error("Error creating notification for warning update:", err);
    }

    res.status(200).json({
      success: true,
      message: "Warning updated successfully",
      data: warning,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete/Revoke Warning - Admin/HR only
export const deleteWarning = async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to revoke warnings",
      });
    }

    const warning = await Warning.findByIdAndDelete(req.params.id);

    if (!warning) {
      return res.status(404).json({
        success: false,
        message: "Warning not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warning revoked and deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};