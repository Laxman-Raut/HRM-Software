import { createLeaveService } from "../services/leaveService.js";
import Leave from "../models/Leave.js";

// Apply Leave
export const applyLeave = async (req, res) => {
  try {
    const leaveData = {
      ...req.body,
      employee: req.user._id, // Set the employee reference from req.user
    };

    const leave = await createLeaveService(leaveData);

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

// Get Leaves (role-based)
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

// Update Leave Status (Approve/Reject)
export const updateLeaveStatus = async (req, res) => {
  try {
    if (req.user.role === "Employee") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve/reject leave requests",
      });
    }

    const { status, remark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Approved or Rejected",
      });
    }

    const leave = await Leave.findById(req.params.id);
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

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};