import { createLeaveService } from "../services/leaveService.js";
import Leave from "../models/Leave.js";
import { createNotification } from "../services/notificationService.js";

/**
 * APPLY LEAVE (CREATE LEAVE)
 */
export const applyLeave = async (req, res) => {
  try {
    // Only employees (and HR employees) can apply for leave
    // Admin users are in a different collection and cannot apply leave via this endpoint
    if (req.user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot apply for leave. Please use an Employee account.",
      });
    }

    const leaveData = {
      ...req.body,
      employee: req.user._id, // Set the employee reference from req.user (Employee _id)
    };

    const leave = await createLeaveService(leaveData);

    // 🔔 NOTIFY HR
    await createNotification({
      title: "New Leave Request",
      message: `${req.user.firstName || req.user.name || "Employee"} applied for leave`,
      type: "INFO",
      forRole: "HR",
    });

    res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      data: leave,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET LEAVES (role-based)
 */
export const getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Employee") {
      query = { employee: req.user._id };
    }

    const leaves = await Leave.find(query)
      .populate("employee", "firstName lastName employeeId department email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE LEAVE STATUS (APPROVE / REJECT)
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, remark } = req.body; // Approved / Rejected

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Approved or Rejected",
      });
    }

    const leave = await Leave.findById(req.params.id).populate("employee");
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    leave.status = status;
    leave.remark = remark || "";
    leave.approvedById = req.user._id;
    leave.approvedByRole = req.user.role;
    leave.approvedByName = req.user.name || req.user.firstName || "Admin";

    await leave.save();

    // Populate employee details for response consistency
    await leave.populate("employee", "firstName lastName employeeId department email");

    // 🔔 NOTIFY EMPLOYEE
    if (status === "Approved") {
      await createNotification({
        title: "Leave Approved",
        message: "Your leave has been approved",
        type: "SUCCESS",
        forRole: "Employee",
      });
    }

    if (status === "Rejected") {
      await createNotification({
        title: "Leave Rejected",
        message: "Your leave has been rejected",
        type: "WARNING",
        forRole: "Employee",
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};