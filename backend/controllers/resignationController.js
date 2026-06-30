import Resignation from "../models/Resignation.js";
import { createNotification } from "../services/notificationService.js";

export const createResignation = async (req, res) => {
  try {
    const {
      reason,
      lastWorkingDay,
      noticePeriod,
    } = req.body;

    // Check if employee already has an active resignation
    const existingResignation = await Resignation.findOne({
      employee: req.user._id,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingResignation) {
      return res.status(400).json({
        success: false,
        message: "You already have an active resignation request.",
      });
    }

    const resignation = await Resignation.create({
      employee: req.user._id,
      reason,
      lastWorkingDay,
      noticePeriod,
    });

    res.status(201).json({
      success: true,
      message: "Resignation submitted successfully.",
      data: resignation,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllResignations = async (req, res) => {
  try {
    const resignations = await Resignation.find()
      .populate("employee", "employeeId firstName lastName email department designation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resignations.length,
      data: resignations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyResignation = async (req, res) => {
  try {
    const resignation = await Resignation.findOne({ employee: req.user._id })
      .populate("employee", "employeeId firstName lastName email department designation");

    res.status(200).json({
      success: true,
      data: resignation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateResignationStatus = async (req, res) => {
  try {
    const { status, hrRemarks } = req.body;
    const resignation = await Resignation.findById(req.params.id);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "Resignation request not found.",
      });
    }

    resignation.status = status;
    if (hrRemarks !== undefined) resignation.hrRemarks = hrRemarks;
    resignation.approvedBy = req.user.firstName + " " + req.user.lastName;
    resignation.approvedDate = new Date();

    await resignation.save();

    // Create a notification for the roles
    try {
      await createNotification({
        title: `Resignation Request ${status}`,
        message: `A resignation request has been ${status.toLowerCase()}.${hrRemarks ? ` Remarks: ${hrRemarks}` : ""}`,
        type: status === "Approved" ? "SUCCESS" : status === "Rejected" ? "ERROR" : "INFO",
        forRole: "Employee",
      });
    } catch (notifyErr) {
      console.error("Failed to send notification:", notifyErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Resignation request ${status.toLowerCase()} successfully.`,
      data: resignation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteResignation = async (req, res) => {
  try {
    const resignation = await Resignation.findById(req.params.id);

    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: "Resignation request not found.",
      });
    }

    // If request is made by an Employee, they can only delete (revoke) their own request, and only if it's still Pending
    if (req.user.role === "Employee") {
      if (resignation.employee.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to revoke this resignation request.",
        });
      }
      if (resignation.status !== "Pending") {
        return res.status(400).json({
          success: false,
          message: "You can only revoke a resignation request that is still pending.",
        });
      }
    }

    await Resignation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: req.user.role === "Employee" ? "Resignation request revoked successfully." : "Resignation request deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};